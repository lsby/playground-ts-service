import { JSON状态接口, 业务行为 } from '@lsby/net-core'
import { 上传文件 } from '../../../model/base/upload-file'
import { 检查登录 } from '../../../model/check/check-login'
import 接口描述 from './type'

export default new JSON状态接口<typeof 接口描述>(
  接口描述,
  业务行为.混合组合多项([
    // ..
    new 检查登录(),
    new 上传文件(),
  ]),
)
