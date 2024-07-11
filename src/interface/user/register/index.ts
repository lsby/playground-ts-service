import { 接口, 正确JSON结果, 错误JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../../../global/global'
import { 用户 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('login')

    var 存在判定 = await 用户.通过名称读取用户(插件结果.body.name).run()
    if (存在判定.isJust()) {
      await log.err('用户名已存在: %o', 插件结果.body.name).run()
      return new 错误JSON结果('用户名已存在' as '用户名已存在')
    }

    await 用户.创建用户({ name: 插件结果.body.name, pwd: 插件结果.body.pwd }).run()

    return new 正确JSON结果({})
  })
})
