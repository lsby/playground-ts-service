import { JSON状态接口 } from '@lsby/net-core'
import { 上传文件 } from '../../../model/base/upload-file'
import 接口描述 from './type'

export default new JSON状态接口<typeof 接口描述>(接口描述, new 上传文件())
