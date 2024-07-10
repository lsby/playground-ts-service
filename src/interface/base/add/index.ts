import { 接口, 正确JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    return new 正确JSON结果({
      res: 插件结果.body.a + 插件结果.body.b,
    })
  })
})
