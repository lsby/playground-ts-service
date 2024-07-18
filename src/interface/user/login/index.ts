import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  var log = (await Global.getItem('log')).extend('login')
  var db = await Global.getItem('kysely')

  var user = await db
    .获得句柄()
    .selectFrom('user')
    .select(['id'])
    .where('name', '=', 插件结果.body.name)
    .where('pwd', '=', 插件结果.body.pwd)
    .executeTakeFirst()

  if (user == null) {
    await log.err('用户名或密码错误')
    return new 包装的错误JSON结果('用户名或密码错误' as const)
  }

  var token = 插件结果.signJwt({ userId: user.id })

  return new 包装的正确JSON结果({ token })
})
