import { z } from 'zod'
import { 接口类型 } from '@lsby/net-core'

export default new 接口类型('/.*', 'get', [], z.unknown(), z.null(), 2)
