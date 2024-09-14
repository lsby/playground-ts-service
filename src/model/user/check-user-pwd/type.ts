import { z } from 'zod'
import { userSchema } from '../../../types/db-zod'

export var 输入描述 = z.object({
  用户: userSchema,
  输入密码: z.string(),
})
export var 输出描述 = z.object({})
export var 错误描述 = z.enum(['密码错误'])
