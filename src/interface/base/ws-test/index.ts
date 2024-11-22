import { JSON状态接口 } from '@lsby/net-core'
import { WebSocket测试 } from '../../../interface-action/base/ws-test'
import 接口描述 from './type'

export default new JSON状态接口<typeof 接口描述>(接口描述, new WebSocket测试())
