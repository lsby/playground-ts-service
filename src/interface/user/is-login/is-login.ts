import { JSON状态接口 } from '@lsby/net-core'
import { 用户已登录 } from '../../../model/user/is-login'
import 接口描述 from './type'

type 接口描述类型 = typeof 接口描述

export default new JSON状态接口<接口描述类型>(接口描述, new 用户已登录())
