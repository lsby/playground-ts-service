import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { 兜底错误 } from '../../../model/abstract/action'

var 输入zod = z.object({
  a: z.number(),
  b: z.number(),
})
var 输出zod = z.object({
  res: z.number(),
})
var 错误zod = z.enum([兜底错误])

export type 输入 = z.infer<typeof 输入zod>
export type 输出 = z.infer<typeof 输出zod>
export type 错误 = z.infer<typeof 错误zod>

export default new 包装的接口类型(
  '/api/base/add',
  'post',
  [
    new Task(async () => {
      return new JSON解析插件(输入zod, {})
    }),
  ],
  输出zod,
  错误zod,
)
