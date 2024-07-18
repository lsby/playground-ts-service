import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'

export default new 包装的接口类型(
  '/api/user/register',
  'post',
  [
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          name: z.string(),
          pwd: z.string(),
        }),
        {},
      )
    }),
  ],
  z.object({
    state: z.literal('success'),
  }),
  z.enum(['用户名已存在']),
)
