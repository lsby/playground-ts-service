import assert from 'assert'
import { randomUUID } from 'crypto'
import { 测试 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { clearDB } from '../../../../script/db/clear-db'
import { GlobalKysely, GlobalLog } from '../../../global/global'
import { 请求用例01 } from '../../../tools/test/request-case-01'
import 接口类型 from './type'

var name = 'admin'
var pwd = '123456'

export default new 测试(
  接口类型,
  new Task(async () => {
    var db = (await GlobalKysely.getInstance().run()).获得句柄()
    await clearDB(db).run()
    await db.insertInto('user').values({ id: randomUUID(), name, pwd }).execute()
  }),
  new Task(async () => {
    return await 请求用例01(接口类型, {}, { 接口: '/api/user/login', 用户名: name, 密码: pwd, 凭据属性: 'token' }).run()
  }),
  (data) =>
    new Task(async () => {
      var log = await GlobalLog.getInstance().run()

      var 正确结果 = 接口类型.获得正确结果类型().safeParse(data)
      var 错误结果 = 接口类型.获得错误结果类型().safeParse(data)
      if (!正确结果.success && !错误结果.success) {
        await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors).run()
        throw new Error('非预期的返回值')
      }

      if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
      var 结果 = 正确结果.data

      assert.equal(结果.isLogin, true)
    }),
)
