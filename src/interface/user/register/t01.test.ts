import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import { randomUUID } from 'crypto'
import { cleanDB } from '../../../../script/db/clean-db'
import { version } from '../../../app/meta-info'
import { kysely管理器 } from '../../../global/global'
import { POST请求用例 } from '../../../tools/request'
import 接口 from './index'

export default new 接口测试(
  接口,
  '成功',
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
    await db
      .insertInto('system_config')
      .values({ id: randomUUID(), is_initialized: 1, enable_register: 1, version: version })
      .execute()
  },

  async (): Promise<object> => {
    return POST请求用例(接口, { userName: 'admin', userPassword: '123456' })
  },

  async (_解析结果): Promise<void> => {
    let db = kysely管理器.获得句柄()
    let r = await db.selectFrom('user').select('id').execute()
    assert.equal(r.length, 1, '应该有一个用户')
  },
)
