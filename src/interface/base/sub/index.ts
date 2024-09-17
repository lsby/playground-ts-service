import { JSON状态接口, 业务行为 } from '@lsby/net-core'
import { 减法 } from '../../../model/base/sub'
import { 检查登录 } from '../../../model/user/check-login'
import 接口描述 from './type'

export default new JSON状态接口<typeof 接口描述>(
  接口描述,
  业务行为.混合组合多项([
    // ..
    new 检查登录(),
    new 减法(),
  ]),
)
