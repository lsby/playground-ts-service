import { z } from 'zod'
import { userSchema } from '../../../types/db-zod'

export var 输入形状 = z.object({
  用户: userSchema,
  输入密码: z.string(),
})
export var 输出形状 = z.object({})
export var 错误形状 = z.enum(['密码错误'])
