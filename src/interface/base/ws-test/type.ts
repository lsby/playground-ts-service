import { JSON状态接口类型, JSON解析插件, WebSocket插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

export default new JSON状态接口类型(
  '/api/base/ws-test',
  'post',
  [
    new Task(async () => {
      return new WebSocket插件(
        z.object({
          data: z.string(),
        }),
      )
    }),
    new Task(async () => {
      return new JSON解析插件(z.object({}), {})
    }),
  ],
  z.object({}),
  z.never(),
)
