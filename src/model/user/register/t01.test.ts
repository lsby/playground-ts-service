import assert from 'assert'
import { 接口测试 } from '@lsby/net-core'
import { clearDB } from '../../../../script/db/clear-db'
import { Global } from '../../../global/global'
import { 请求用例00 } from '../../../util/request-case-00'
import { 接口描述 } from './type'

export class 我的测试 extends 接口测试 {
  override async 前置实现(): Promise<void> {
    var db = (await Global.getItem('kysely')).获得句柄()
    await clearDB(db)
  }

  override async 中置实现(): Promise<object> {
    return 请求用例00(接口描述, { name: 'admin', pwd: '123456' })
  }

  override async 后置实现(中置结果: object): Promise<void> {
    var log = await Global.getItem('log')

    var 正确结果 = 接口描述.获得正确结果类型().safeParse(中置结果)
    var 错误结果 = 接口描述.获得错误结果类型().safeParse(中置结果)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var _结果 = 正确结果.data

    var db = (await Global.getItem('kysely')).获得句柄()

    var r = await db.selectFrom('user').select('id').execute()
    assert.equal(r.length, 1, '应该有一个用户')
  }
}
