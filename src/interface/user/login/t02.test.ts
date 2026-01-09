import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { cleanDB } from '../../../../script/db/clean-db'
import { 环境变量 } from '../../../global/env'
import { kysely管理器 } from '../../../global/global'
import { POST请求用例 } from '../../../tools/request'
import 接口 from './index'

let name = 'admin'
let pwd = '123456'

export default new 接口测试(
  接口,
  '失败',
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
    await db
      .insertInto('user')
      .values({ id: randomUUID(), name: name, pwd: await bcrypt.hash(pwd, 环境变量.BCRYPT_ROUNDS), is_admin: 0 })
      .execute()
  },
  async (): Promise<object> => {
    return POST请求用例(接口, { userName: 'aaabbbccc', userPassword: 'bbbcccddd' })
  },
  async (解析结果): Promise<void> => {
    assert.equal(解析结果.data, '用户不存在或密码错误')
  },
)
