import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'

export default new 包装的接口类型(
  '/api/base/sub',
  'post',
  [
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          body: z.object({
            a: z.number(),
            b: z.number(),
          }),
        }),
        {},
      )
    }),
  ],
  z.object({
    res: z.number(),
  }),
  z.never(),
)
