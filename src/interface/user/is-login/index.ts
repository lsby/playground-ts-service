import { 接口, 正确JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('is-login')

    var userId = 插件结果.userId
    await log.debug('解析出的userId: %o', userId).run()

    if (userId == null) return new 正确JSON结果({ isLogin: false })

    return new 正确JSON结果({ isLogin: true })
  })
})
