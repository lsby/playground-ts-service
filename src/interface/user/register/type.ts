import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'

export default new 接口类型(
  '/api/user/register',
  'post',
  [
    Promise.resolve(
      new JSON解析插件(
        z.object({
          body: z.object({
            name: z.string(),
            pwd: z.string(),
          }),
        }),
        {},
      ),
    ),
  ],
  z.object({}),
  z.enum(['用户名已存在']),
)
