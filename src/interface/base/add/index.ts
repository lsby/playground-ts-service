import { JSON状态接口 } from '@lsby/net-core'
import { 加法 } from '../../../model/base/add'
import 接口描述 from './type'

type 接口描述类型 = typeof 接口描述

export default new JSON状态接口<接口描述类型>(接口描述, new 加法())
