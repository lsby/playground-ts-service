import { Readable } from 'node:stream'
import axios from 'axios'
import streamToBlob from 'stream-to-blob'
import { 测试 } from '@lsby/net-core'
import { GlobalEnv, GlobalLog } from '../../../global/global'
import 接口类型 from './type'

export default new 测试(
  接口类型,
  async () => {
    // 前置步骤, 可以在这里初始化数据库等
  },
  async () => {
    var base64Image = 'data:image/png;base64,iVBORw0KGgo...'

    var base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    var buffer = Buffer.from(base64Data, 'base64')
    var readableStream = Readable.from([buffer])
    var blob = await streamToBlob(readableStream)

    var formData = new FormData()
    formData.append('file', blob, 'image.png')

    var env = await GlobalEnv.getInstance()
    var urlPath = 接口类型.获得路径()
    var url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`
    await axios.post(url, formData, {})

    return {}
  },
  async (data) => {
    var log = await GlobalLog.getInstance()

    var 正确结果 = 接口类型.获得正确结果类型().safeParse(data)
    var 错误结果 = 接口类型.获得错误结果类型().safeParse(data)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var _结果 = 正确结果.data
  },
)
