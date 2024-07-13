import { z } from 'zod'
import { 接口类型 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import { 文件上传插件 } from '../../../tool/plugin/form-data-file'

export default new 接口类型(
  '/api/base/upload-file',
  'post',
  [
    await Global.getItem('env').then((getEnv) =>
      getEnv.获得环境变量().then((env) => new 文件上传插件({ 文件最大大小: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 })),
    ),
  ],
  z.object({}),
  z.null(),
)
