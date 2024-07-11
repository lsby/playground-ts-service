import assert from 'assert'
import { randomUUID } from 'crypto'
import axios from 'axios'
import { 测试 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { clearDB } from '../../../../script/db/clear-db'
import { GlobalEnv, GlobalKysely, GlobalLog } from '../../../global/global'
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
    var env = await GlobalEnv.getInstance().run()

    var urlPath = 接口类型.获得路径()
    var url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

    return (await axios.post(url, {}, { headers: { authorization: '' } })).data
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

      assert.equal(结果.isLogin, false)
    }),
)
