import { randomUUID } from 'crypto'
import { CONST, Global } from './global/global'

export async function init(): Promise<void> {
  let log = (await Global.getItem('log')).extend('init')
  let kysely = (await Global.getItem('kysely')).获得句柄()

  await log.debug('检索初始化标记...')
  let 初始化标记 = await kysely
    .selectFrom('config')
    .select('value')
    .where('key', '=', CONST.INIT_FLAG)
    .executeTakeFirst()
  if (初始化标记?.value == 'true') {
    await log.debug('初始化标记已存在, 跳过初始化')
    return
  }

  await log.debug('初始化标记不存在, 开始初始化...')

  let 项目名称: string

  项目名称 = '用户'
  try {
    await log.debug(`初始化${项目名称}...`)
    await kysely
      .insertInto('user')
      .values({
        id: randomUUID(),
        name: 'admin',
        pwd: '123456',
      })
      .execute()
    await log.debug(`初始化${项目名称}完成`)
  } catch (e) {
    await log.debug(`初始化${项目名称}失败: %O`, e)
  }

  await log.debug('初始化完成, 写入初始化标记...')
  await kysely.insertInto('config').values({ id: randomUUID(), key: CONST.INIT_FLAG, value: 'true' }).execute()
  await log.debug('写入初始化标记完成')
}
