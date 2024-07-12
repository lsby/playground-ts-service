import { 接口, 正确JSON结果 } from '@lsby/net-core'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  return new 正确JSON结果({
    res: 插件结果.body.a + 插件结果.body.b,
  })
})
