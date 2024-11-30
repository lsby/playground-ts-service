import { 接口测试 } from '@lsby/net-core'
import axios from 'axios'
import { randomUUID } from 'crypto'
import { Readable } from 'stream'
import streamToBlob from 'stream-to-blob'
import { clearDB } from '../../../../script/db/clear-db'
import { Global } from '../../../global/global'
import 接口描述 from './type'

let name = 'admin'
let pwd = '123456'

export default new 接口测试(
  async () => {
    let db = (await Global.getItem('kysely')).获得句柄()
    await clearDB(db)
    await db.insertInto('user').values({ id: randomUUID(), name: name, pwd: pwd }).execute()
  },

  async () => {
    let base64Image = 'data:image/png;base64,iVBORw0KGgo...'
    let base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    let buffer = Buffer.from(base64Data, 'base64')
    let readableStream = Readable.from([buffer])
    let blob = await streamToBlob(readableStream)

    let formData = new FormData()
    formData.append('file', blob, 'image.png')

    let env = await (await Global.getItem('env')).获得环境变量()
    let urlPath = 接口描述.获得路径()
    let url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

    let login = (await axios.post(`http://127.0.0.1:${env.APP_PORT}${'/api/user/login'}`, {
      name,
      pwd,
    })) as { data: { data: { [key: string]: string } } }
    let token = login.data.data['token']

    return (await axios.post(url, formData, { headers: { authorization: token } })).data
  },

  async (中置结果) => {
    let log = await Global.getItem('log')

    let 正确结果 = 接口描述.获得正确结果类型().safeParse(中置结果)
    let 错误结果 = 接口描述.获得错误结果类型().safeParse(中置结果)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    let _结果 = 正确结果.data
  },
)
