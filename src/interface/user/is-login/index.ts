import { 接口, 正确JSON结果 } from '@lsby/net-core'
import { GlobalLog } from '../../../global/global'
import { 用户模型 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  var log = (await GlobalLog.getInstance()).extend('is-login')

  var userId = 插件结果.userId
  await log.debug('解析出的userId: %o', userId)

  if (userId == null) return new 正确JSON结果({ isLogin: false })

  var 用户 = await 用户模型.通过id读取用户(userId)
  await log.debug('解析出的用户id: %o', 用户.assertJust().getJust().getId())

  return new 正确JSON结果({ isLogin: true })
})
