import { 接口, 正确JSON结果 } from '@lsby/net-core'
import { GlobalLog } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (插件结果) => {
  var log = (await GlobalLog.getInstance()).extend('upload-file')

  await log.debug('上传的文件信息: %j', 插件结果.files)

  return new 正确JSON结果({})
})
