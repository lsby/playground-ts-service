import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import { createHash, randomUUID } from 'crypto'
import { clearDB } from '../../../../script/db/clear-db'
import { Global } from '../../../global/global'
import { 请求用例 } from '../../../tools/request'
import 接口 from './index'

let name = 'admin'
let pwd = '123456'
export default new 接口测试(
  async (): Promise<void> => {
    let db = (await Global.getItem('kysely')).获得句柄()
    await clearDB(db)
    await db
      .insertInto('user')
      .values({ id: randomUUID(), name: name, pwd: createHash('md5').update(pwd).digest('hex') })
      .execute()
  },

  async (): Promise<object> => {
    return 请求用例(接口, { userName: name, userPassword: pwd })
  },

  async (中置结果: object): Promise<void> => {
    let log = await Global.getItem('log')

    let 错误结果 = 接口.获得接口错误形式Zod().safeParse(中置结果)
    let 正确结果 = 接口.获得接口正确形式Zod().safeParse(中置结果)
    if (错误结果.success === false && 正确结果.success === false) {
      await log.error('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (正确结果.success === false) throw new Error('应该调用成功, 实际调用出错')
    let 结果 = 正确结果.data

    assert.notEqual(结果.data.token.length, null)
  },
)
