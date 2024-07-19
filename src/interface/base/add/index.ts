import { 包装的正确JSON结果, 接口 } from '@lsby/net-core'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  return new 包装的正确JSON结果({
    res: ctx.body.a + ctx.body.b,
  })
})
