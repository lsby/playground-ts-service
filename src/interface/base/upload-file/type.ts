import { z } from 'zod'
import { 包装的接口类型 } from '@lsby/net-core'
import { 文件上传插件 } from '@lsby/net-core-file-upload'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'

export default new 包装的接口类型(
  '/api/base/upload-file',
  'post',
  [
    new Task(async () => {
      var env = await (await Global.getItem('env')).获得环境变量()
      return new 文件上传插件({ 文件最大大小: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 })
    }),
  ],
  z.object({}),
  z.never(),
)
