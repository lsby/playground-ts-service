import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import { Global } from '../../../global/global'
import { 请求用例 } from '../../../tools/request'
import 接口 from './index'

export default new 接口测试(
  async (): Promise<void> => {},

  async (): Promise<object> => {
    return 请求用例(接口, {
      a: 2,
      b: 1,
    })
  },

  async (中置结果: object): Promise<void> => {
    let log = await Global.getItem('log')

    let 错误结果 = 接口.获得接口错误形式Zod().safeParse(中置结果)
    let 正确结果 = 接口.获得接口正确形式Zod().safeParse(中置结果)
    if (错误结果.success === false && 正确结果.success === false) {
      await log.error('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (错误结果.success === false) throw new Error('应该调用出错, 实际调用成功')
    let 结果 = 错误结果.data

    assert.equal(结果.data, '未登录')
  },
)
