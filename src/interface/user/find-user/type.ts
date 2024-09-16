import { z } from 'zod'
import { JSON状态接口类型, JSON解析插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { userSchema } from '../../../types/db-zod'

export var 接口描述 = new JSON状态接口类型(
  null,
  'post',
  [
    new Task(async () => {
      return await Global.getItem('kysely-plugin')
    }),
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          用户名: z.string(),
        }),
        {},
      )
    }),
  ],
  z.object({
    用户: userSchema.or(z.null()),
  }),
  z.never(),
)
