import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { Global } from '../global/global'

export async function init(): Promise<void> {
  let log = await Global.getItem('log').then((a) => a.extend('init'))
  let env = await Global.getItem('env').then((a) => a.获得环境变量())
  let kysely = await Global.getItem('kysely')

  log.debug('检索初始化标记...')
  let 初始化标记 = await kysely.获得句柄().selectFrom('system_config').select('is_initialized').executeTakeFirst()
  if (初始化标记?.is_initialized === 1) {
    log.debug('初始化标记已存在, 跳过初始化')
    return
  }

  log.debug('初始化标记不存在, 开始初始化...')

  let 项目名称: string
  let 初始用户id: string

  let 用户存在判定 = await kysely
    .获得句柄()
    .selectFrom('user')
    .select('id')
    .where('name', '=', env.SYSTEM_USER)
    .where('pwd', '=', await bcrypt.hash(env.SYSTEM_PWD, 10))
    .executeTakeFirst()

  if (用户存在判定 !== void 0) {
    初始用户id = 用户存在判定.id
  } else {
    初始用户id = randomUUID()
  }

  项目名称 = '用户'
  try {
    log.debug(`初始化${项目名称}...`)
    await kysely.执行事务(async (trx) => {
      await trx
        .insertInto('user')
        .values({
          id: 初始用户id,
          name: env.SYSTEM_USER,
          pwd: await bcrypt.hash(env.SYSTEM_PWD, 10),
          is_admin: 1,
        })
        .execute()
      await trx
        .insertInto('user_config')
        .values({
          id: randomUUID(),
          user_id: 初始用户id,
        })
        .execute()
    })
    log.debug(`初始化${项目名称}完成`)
  } catch (e) {
    log.debug(`初始化${项目名称}失败: %O`, e)
  }

  log.debug('初始化完成, 写入初始化标记...')
  await kysely.获得句柄().deleteFrom('system_config').execute()
  await kysely.获得句柄().insertInto('system_config').values({ id: randomUUID(), is_initialized: 1 }).execute()
  log.debug('写入初始化标记完成')
}
