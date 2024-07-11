import assert from 'assert'
import { 测试 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { clearDB } from '../../../../script/db/clear-db'
import { GlobalKysely, GlobalLog } from '../../../global/global'
import { 请求用例00 } from '../../../tools/test/request-case-00'
import 接口类型 from './type'

export default new 测试(
  接口类型,
  new Task(async () => {
    var db = (await GlobalKysely.getInstance().run()).获得句柄()
    await clearDB(db).run()
  }),
  new Task(async () => {
    return await 请求用例00(接口类型, { name: 'admin', pwd: '123456' }).run()
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
      var _结果 = 正确结果.data

      var db = (await GlobalKysely.getInstance().run()).获得句柄()

      var r = await db.selectFrom('user').select('id').execute()
      assert.equal(r.length, 1, '应该有一个用户')
    }),
)
