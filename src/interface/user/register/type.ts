import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'

export default new 接口类型(
  '/api/user/register',
  'post',
  [
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          body: z.object({
            name: z.string(),
            pwd: z.string(),
          }),
        }),
        {},
      )
    }),
  ],
  z.object({
    state: z.literal('success'),
  }),
  z.object({
    state: z.literal('fail'),
    error: z.enum(['用户名已存在']),
  }),
)
