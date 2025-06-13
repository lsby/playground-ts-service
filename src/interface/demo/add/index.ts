import {
  JSON解析插件,
  常用形式转换器,
  接口,
  接口逻辑,
  获得接口逻辑正确类型,
  获得接口逻辑错误类型,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 加法接口组件 } from '../../../interface-components/add'

let 接口路径 = '/api/demo/add' as const
let 接口方法 = 'post' as const

let 逻辑错误类型Zod = z.never()
let 逻辑正确类型Zod = z.object({
  res: z.number(),
})

let 逻辑实现 = new 加法接口组件([
  new Task(
    async () =>
      new JSON解析插件(
        z.object({
          a: z.number(),
          b: z.number(),
        }),
        {},
      ),
  ),
])
let 接口实现 = 接口逻辑.混合([逻辑实现])

let 接口错误输出形式 = z.object({ status: z.literal('fail'), data: 逻辑错误类型Zod })
let 接口正确输出形式 = z.object({ status: z.literal('success'), data: 逻辑正确类型Zod })
let 接口转换器 = new 常用形式转换器<获得接口逻辑错误类型<typeof 接口实现>, 获得接口逻辑正确类型<typeof 接口实现>>()
export default new 接口(接口路径, 接口方法, 接口实现, 接口错误输出形式, 接口正确输出形式, 接口转换器)
