import { createHash, randomUUID } from 'crypto'
import { CONST, Global } from '../global/global'

export async function init(): Promise<void> {
  let log = (await Global.getItem('log')).extend('init')
  let env = await (await Global.getItem('env')).获得环境变量()
  let kysely = (await Global.getItem('kysely')).获得句柄()

  await log.debug('检索初始化标记...')
  let 初始化标记 = await kysely
    .selectFrom('system_config')
    .select('value')
    .where('key', '=', CONST.INIT_FLAG)
    .executeTakeFirst()
  if (初始化标记?.value === 'true') {
    await log.debug('初始化标记已存在, 跳过初始化')
    return
  }

  await log.debug('初始化标记不存在, 开始初始化...')

  let 项目名称: string
  let 初始用户id: string

  let 用户存在判定 = await kysely
    .selectFrom('user')
    .select('id')
    .where('name', '=', env.SYSTEM_USER)
    .where('pwd', '=', createHash('md5').update(env.SYSTEM_PWD).digest('hex'))
    .executeTakeFirst()

  if (用户存在判定 !== void 0) {
    初始用户id = 用户存在判定.id
  } else {
    初始用户id = randomUUID()
  }

  项目名称 = '用户'
  try {
    await log.debug(`初始化${项目名称}...`)
    await kysely
      .insertInto('user')
      .values({
        id: 初始用户id,
        name: env.SYSTEM_USER,
        pwd: createHash('md5').update(env.SYSTEM_PWD).digest('hex'),
      })
      .execute()
    await log.debug(`初始化${项目名称}完成`)
  } catch (e) {
    await log.debug(`初始化${项目名称}失败: %O`, e)
  }

  await log.debug('初始化完成, 写入初始化标记...')
  await kysely.deleteFrom('system_config').where('key', '=', CONST.INIT_FLAG).execute()
  await kysely.insertInto('system_config').values({ id: randomUUID(), key: CONST.INIT_FLAG, value: 'true' }).execute()
  await log.debug('写入初始化标记完成')
}
