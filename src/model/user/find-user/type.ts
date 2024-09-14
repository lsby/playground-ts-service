import { Kysely } from 'kysely'
import { z } from 'zod'
import { DB } from '../../../types/db'
import { userSchema } from '../../../types/db-zod'

export var 输入形状 = z.object({
  用户名: z.string(),
  kysely: z.custom<Kysely<DB>>((instance) => instance instanceof Kysely),
})
export var 输出形状 = z.object({
  用户: userSchema.or(z.null()),
})
export var 错误形状 = z.never()
