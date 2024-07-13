import assert from 'assert'
import { 测试 } from '@lsby/net-core'
import { clearDB } from '../../../../script/db/clear-db'
import { Global, GlobalKysely } from '../../../global/global'
import { 请求用例00 } from '../../../util/test/request-case-00'
import 接口类型 from './type'

export default new 测试(
  接口类型,
  async () => {
    var db = (await GlobalKysely.getInstance()).获得句柄()
    await clearDB(db)
  },
  async () => {
    return 请求用例00(接口类型, { name: 'admin', pwd: '123456' })
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
    var _结果 = 正确结果.data

    var db = (await GlobalKysely.getInstance()).获得句柄()

    var r = await db.selectFrom('user').select('id').execute()
    assert.equal(r.length, 1, '应该有一个用户')
  },
)
