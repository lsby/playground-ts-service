import { 接口, 正确JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('upload-file')

    await log.debug('上传的文件信息: %j', 插件结果.files).run()

    return new 正确JSON结果({})
  })
})
