import { z } from 'zod'
import { 包装的接口类型 } from '@lsby/net-core'
import { 文件上传插件 } from '@lsby/net-core-file-upload'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 兜底错误 } from '../../../model/abstract/action'

var 输入zod = z.object({})
var 输出zod = z.object({})
var 错误zod = z.enum([兜底错误])

export type 输入 = z.infer<typeof 输入zod>
export type 输出 = z.infer<typeof 输出zod>
export type 错误 = z.infer<typeof 错误zod>

export default new 包装的接口类型(
  '/api/base/upload-file',
  'post',
  [
    new Task(async () => {
      var env = await (await Global.getItem('env')).获得环境变量()
      return new 文件上传插件({ 文件最大大小: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 })
    }),
  ],
  输出zod,
  错误zod,
)
