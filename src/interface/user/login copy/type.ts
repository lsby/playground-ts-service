import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 兜底错误 } from '../../../model/abstract/action'

var 输入zod = z.object({
  name: z.string(),
  pwd: z.string(),
})
var 输出zod = z.object({
  token: z.string(),
})
var 错误zod = z.enum([兜底错误, '用户不存在', '密码错误'])

export type 输入 = z.infer<typeof 输入zod> & { 签名函数: (args_0: { userId?: string | undefined }) => string }
export type 输出 = z.infer<typeof 输出zod>
export type 错误 = z.infer<typeof 错误zod>

export default new 包装的接口类型(
  '/api/user/login',
  'post',
  [
    new Task(async () => {
      var jwt = await Global.getItem('jwt-plugin')
      return jwt.签名器
    }),
    new Task(async () => {
      return new JSON解析插件(输入zod, {})
    }),
  ],
  输出zod,
  错误zod,
)
