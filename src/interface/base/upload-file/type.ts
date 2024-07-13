import { z } from 'zod'
import { 接口类型 } from '@lsby/net-core'
import { 文件上传插件 } from '../../../tool/plugin/form-data-file'

export default new 接口类型(
  '/api/base/upload-file',
  'post',
  [Promise.resolve(new 文件上传插件({ 文件最大大小: 50 * 1024 * 1024 }))],
  z.object({}),
  z.null(),
)
