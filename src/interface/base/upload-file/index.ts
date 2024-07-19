import { 包装的正确JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  var log = (await Global.getItem('log')).extend('upload-file')

  await log.debug('上传的文件信息: %j', ctx.files)

  return new 包装的正确JSON结果({})
})
