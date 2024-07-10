import assert from 'assert'
import { 测试 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { 请求用例00 } from '../../tools/test/request-case-00'
import 接口类型 from './type'

export default new 测试(
  接口类型,
  new Task(async () => {
    // console.log('前置步骤, 可以在这里初始化数据库等')
  }),
  new Task(async () => {
    return await 请求用例00(接口类型, {
      a: 1,
      b: 2,
    })
  }),
  (data) =>
    new Task(async () => {
      var 正确结果 = 接口类型.获得正确结果类型().safeParse(data)
      var 错误结果 = 接口类型.获得错误结果类型().safeParse(data)
      if (!正确结果.success && !错误结果.success) {
        console.log('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
        throw new Error('非预期的返回值')
      }

      if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
      var 结果 = 正确结果.data

      assert.equal(结果.res, 3)
    }),
)
