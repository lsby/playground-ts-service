import { Readable } from 'node:stream'
import axios from 'axios'
import streamToBlob from 'stream-to-blob'
import { 测试抽象类 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

class 我的测试 extends 测试抽象类 {
  override async 前置实现(): Promise<void> {}

  override async 中置实现(): Promise<object> {
    var base64Image = 'data:image/png;base64,iVBORw0KGgo...'

    var base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    var buffer = Buffer.from(base64Data, 'base64')
    var readableStream = Readable.from([buffer])
    var blob = await streamToBlob(readableStream)

    var formData = new FormData()
    formData.append('file', blob, 'image.png')

    var env = await (await Global.getItem('env')).获得环境变量()
    var urlPath = 接口类型.获得路径()
    var url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`
    return (await axios.post(url, formData, {})).data
  }

  override async 后置实现(中置结果: object): Promise<void> {
    var log = await Global.getItem('log')

    var 正确结果 = 接口类型.获得正确结果类型().safeParse(中置结果)
    var 错误结果 = 接口类型.获得错误结果类型().safeParse(中置结果)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }

    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var _结果 = 正确结果.data
  }
}

export default new 我的测试()
