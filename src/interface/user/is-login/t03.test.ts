import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { cleanDB } from '../../../../script/db/clean-db'
import { 环境变量 } from '../../../global/env'
import { kysely管理器 } from '../../../global/global'
import 接口 from './index'

let name = 'admin'
let pwd = '123456'
export default new 接口测试(
  async (): Promise<void> => {
    let db = kysely管理器.获得句柄()
    await cleanDB(db)
    await db
      .insertInto('user')
      .values({ id: randomUUID(), name: name, pwd: await bcrypt.hash(pwd, 环境变量.BCRYPT_ROUNDS), is_admin: 0 })
      .execute()
  },

  async (): Promise<object> => {
    let urlPath = 接口.获得路径()
    let url = `http://127.0.0.1:${环境变量.APP_PORT}${urlPath}`

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: '' },
      body: JSON.stringify({}),
    })
    return await response.json()
  },

  async (中置结果: object): Promise<void> => {
    console.log('实际结果: %o', 中置结果)

    let 预期: string = '成功'

    let 失败结果校验 = 接口.获得接口错误形式Zod().safeParse(中置结果)
    let 正确结果校验 = 接口.获得接口正确形式Zod().safeParse(中置结果)

    if (失败结果校验.success === false && 正确结果校验.success === false) {
      throw new Error('没有通过返回值检查')
    }
    if (正确结果校验.success === true) {
      console.log('预期: %o, 实际: %o', 预期, '调用成功')
      if (预期 === '失败') throw new Error('应该调用失败, 实际调用成功')
    }
    if (失败结果校验.success === true) {
      console.log('预期: %o, 实际: %o', 预期, '调用失败')
      if (预期 === '成功') throw new Error('应该调用成功, 实际调用出错')
    }

    assert.equal(正确结果校验.data?.data.isLogin, false)
  },
)
