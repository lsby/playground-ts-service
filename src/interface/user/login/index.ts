import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  var log = (await Global.getItem('log')).extend('login')
  var db = (await Global.getItem('kysely')).获得句柄()

  var user = await db
    .selectFrom('user')
    .select(['id', 'name', 'pwd'])
    .where('name', '=', ctx.body.name)
    .executeTakeFirst()

  if (user == null || user.pwd != ctx.body.pwd) {
    await log.err('用户名或密码错误')
    return new 包装的错误JSON结果('用户名或密码错误' as const)
  }

  var token = ctx.signJwt({ userId: user.id })

  return new 包装的正确JSON结果({ token })
})
