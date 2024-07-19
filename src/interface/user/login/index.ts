import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { seqMaybePromise } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 用户 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  var log = (await Global.getItem('log')).extend('login')

  var userM = await 用户.通过名称读取用户(插件结果.body.name)
  var pwdM = (await seqMaybePromise(userM.map((a) => a.getPwd()))).bind((a) => a)
  var idM = (await seqMaybePromise(userM.map((a) => a.getId()))).bind((a) => a)

  if (userM.getJustOrNull() == null || pwdM.getJustOrNull() != 插件结果.body.pwd || idM.getJustOrNull() == null) {
    await log.err('用户名或密码错误')
    return new 包装的错误JSON结果('用户名或密码错误' as const)
  }

  var token = 插件结果.signJwt({ userId: idM.assertJust().getJust() })

  return new 包装的正确JSON结果({ token })
})
