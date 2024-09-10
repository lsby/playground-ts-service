import assert from 'assert'
import { randomUUID } from 'crypto'
import { 测试抽象类 } from '@lsby/net-core'
import { clearDB } from '../../../../script/db/clear-db'
import { Global } from '../../../global/global'
import { 请求用例00 } from '../../../util/request-case-00'
import 接口类型 from './type'

class 我的测试 extends 测试抽象类 {
  private name = 'admin'
  private pwd = '123456'

  override async 前置实现(): Promise<void> {
    var db = (await Global.getItem('kysely')).获得句柄()
    await clearDB(db)
    await db.insertInto('user').values({ id: randomUUID(), name: this.name, pwd: this.pwd }).execute()
  }

  override async 中置实现(): Promise<object> {
    return 请求用例00(接口类型, { name: this.name, pwd: this.pwd })
  }

  override async 后置实现(中置结果: object): Promise<void> {
    var log = await Global.getItem('log')

    var 正确结果 = 接口类型.获得正确结果类型().safeParse(中置结果)
    var 错误结果 = 接口类型.获得错误结果类型().safeParse(中置结果)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var 结果 = 正确结果.data

    assert.notEqual(结果.data.token.length, null)
  }
}

export default new 我的测试()
