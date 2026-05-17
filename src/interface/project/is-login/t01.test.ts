import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import { randomUUID } from 'crypto'
import { cleanDB } from '../../../../scripts/db/clean-db'
import { kysely管理器 } from '../../../global/global'
import { POST_JSON请求用例 } from '../../../tools/request'
import 接口 from './index'

export default new 接口测试(
  接口,
  '成功',
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
    await db
      .insertInto('system_config')
      .values({ id: randomUUID(), is_initialized: 1, enable_register: 0, version: '', jwt_secret: '123' })
      .execute()
  },
  async (): Promise<object> => {
    return POST_JSON请求用例(接口, {})
  },
  async (解析结果): Promise<void> => {
    assert.equal(解析结果.data.isLogin, false)
  },
)
