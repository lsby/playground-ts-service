import { z } from 'zod'
import { 接口类型 } from '@lsby/net-core'
import { 上传文件插件 } from '../../../plugin/form-data-file'

export default new 接口类型('/api/base/upload-file', 'post', [new 上传文件插件()], z.object({}), z.null())
