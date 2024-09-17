import { JSON状态接口 } from '@lsby/net-core'
import { 注册 } from '../../../model/user/register'
import 接口描述 from './type'

type 接口描述类型 = typeof 接口描述

export default new JSON状态接口<接口描述类型>(接口描述, new 注册())
