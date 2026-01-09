import { 接口测试 } from '@lsby/net-core'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { cleanDB } from '../../../../../script/db/clean-db'
import { 环境变量 } from '../../../../global/env'
import { kysely管理器 } from '../../../../global/global'
import { POST请求用例 } from '../../../../tools/request'
import 接口 from './index'

let id = randomUUID()
let name = 'admin'
let pwd = '123456'

export default new 接口测试(
  接口,
  '成功',
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
    await db
      .insertInto('user')
      .values({ id: id, name: name, pwd: await bcrypt.hash(pwd, 环境变量.BCRYPT_ROUNDS), is_admin: 1 })
      .execute()
  },

  async (): Promise<object> => {
    return POST请求用例(接口, { id: id }, { 接口: '/api/user/login', 用户名: name, 密码: pwd, 凭据属性: 'token' })
  },

  async (_解析结果): Promise<void> => {},
)
