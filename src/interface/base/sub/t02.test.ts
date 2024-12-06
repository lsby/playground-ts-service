import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import { Global } from '../../../global/global'
import { 请求用例 } from '../../../tools/request'
import 接口描述 from './type'

export default new 接口测试(
  async (): Promise<void> => {},

  async (): Promise<object> => {
    let name = ''
    let pwd = ''
    return 请求用例(
      接口描述,
      {
        a: 2,
        b: 1,
      },
      { 接口: '/api/user/login', 用户名: name, 密码: pwd, 凭据属性: 'token' },
    )
  },

  async (中置结果: object): Promise<void> => {
    let log = await Global.getItem('log')

    let 正确结果 = 接口描述.获得正确结果类型().safeParse(中置结果)
    let 错误结果 = 接口描述.获得错误结果类型().safeParse(中置结果)
    if (正确结果.success === false && 错误结果.success === false) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (错误结果.success === false) throw new Error('应该调用出错, 实际调用成功')
    let 结果 = 错误结果.data

    assert.equal(结果.data, '未登录')
  },
)
