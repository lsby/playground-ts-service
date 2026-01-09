import { 接口测试 } from '@lsby/net-core'
import { cleanDB } from '../../../../../script/db/clean-db'
import { kysely管理器 } from '../../../../global/global'
import { POST请求用例 } from '../../../../tools/request'
import 接口 from './index'

let name = 'newUser'
let pwd = '123456'

export default new 接口测试(
  接口,
  '失败',
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
  },

  async (): Promise<object> => {
    return POST请求用例(接口, { name: name, pwd: pwd })
  },

  async (_解析结果): Promise<void> => {
    let db = kysely管理器.获得句柄()
    let userRow = await db.selectFrom('user').select('id').where('name', '=', name).executeTakeFirst()
    if (userRow !== void 0) throw new Error('不应该插入成功')
  },
)
