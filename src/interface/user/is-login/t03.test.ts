import { 接口测试 } from '@lsby/net-core'
import assert from 'assert'
import axios from 'axios'
import { createHash, randomUUID } from 'crypto'
import { clearDB } from '../../../../script/db/clear-db'
import { Global } from '../../../global/global'
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
    let env = await (await Global.getItem('env')).获得环境变量()

    let urlPath = 接口.获得路径()
    let url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

    return (await axios.post(url, {}, { headers: { authorization: '' } })).data
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
