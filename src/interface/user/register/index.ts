import { randomUUID } from 'crypto'
import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  var log = (await Global.getItem('log')).extend('login')
  var db = await Global.getItem('kysely')

  var 存在判定 = await db
    .获得句柄()
    .selectFrom('user')
    .select(['id', 'name', 'pwd'])
    .where('name', '=', 插件结果.body.name)
    .executeTakeFirst()

  if (存在判定 != null) {
    await log.err('用户名已存在: %o', 插件结果.body.name)
    return new 包装的错误JSON结果('用户名已存在' as const)
  }

  var id = randomUUID()
  await db.获得句柄().insertInto('user').values({ id, name: 插件结果.body.name, pwd: 插件结果.body.pwd }).execute()

  return new 包装的正确JSON结果({
    state: 'success' as const,
  })
})
