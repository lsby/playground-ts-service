import { z } from 'zod'
import { 接口类型 } from '@lsby/net-core'
import { 文件上传插件 } from '../../../plugin/form-data-file'

export default new 接口类型('/api/base/upload-file', 'post', [new 文件上传插件()], z.object({}), z.null())
