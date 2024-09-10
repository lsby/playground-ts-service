import assert from 'assert'
import { 测试 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import { 请求用例00 } from '../../../util/request-case-00'
import 接口类型 from './type'

export default new 测试(
  接口类型,
  async () => {},
  async () => {
    return 请求用例00(接口类型, {
      a: 2,
      b: 1,
    })
  },
  async (data) => {
    var log = await Global.getItem('log')

    var 正确结果 = 接口类型.获得正确结果类型().safeParse(data)
    var 错误结果 = 接口类型.获得错误结果类型().safeParse(data)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var 结果 = 正确结果.data

    assert.equal(结果.data.res, 1)
  },
)
