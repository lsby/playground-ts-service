import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import { 用户 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  var log = (await Global.getItem('log')).extend('login')

  var userM = (await 用户.通过名称读取用户基本信息(ctx.body.name)).getJustOrNull()

  if (userM == null || userM.pwd != ctx.body.pwd) {
    await log.err('用户名或密码错误')
    return new 包装的错误JSON结果('用户名或密码错误' as const)
  }

  var token = ctx.signJwt({ userId: userM.id })

  return new 包装的正确JSON结果({ token })
})
