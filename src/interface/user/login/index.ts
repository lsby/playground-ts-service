import { 接口, 正确JSON结果, 错误JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalJWT, GlobalLog } from '../../../global/global'
import { 用户模型 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('login')

    var 用户 = (await 用户模型.通过名称读取用户(插件结果.body.name).run()).getJustOrNull()

    if (用户 == null || 用户.getPwd() != 插件结果.body.pwd) {
      await log.err('用户名或密码错误').run()
      return new 错误JSON结果('用户名或密码错误' as '用户名或密码错误')
    }

    var jwt = await GlobalJWT.getInstance().run()
    var token = jwt.签名(用户.getId())

    return new 正确JSON结果({ token })
  })
})
