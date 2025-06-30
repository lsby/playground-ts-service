import {
  JSON解析插件,
  合并JSON插件结果,
  合并插件结果,
  常用形式接口封装,
  接口逻辑,
  获得接口逻辑插件类型,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 加法逻辑 } from '../../../logic/components/add'
import { Eq, 构造元组 } from '../../../types'

let 逻辑插件 = 构造元组([
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
type 逻辑参数类型 = 合并插件结果<typeof 逻辑插件>
let 逻辑实现 = new 加法逻辑(逻辑插件)

let 接口路径 = '/api/demo/add' as const
let 接口方法 = 'post' as const

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({
  res: z.number(),
})

let 接口实现 = 接口逻辑.混合([逻辑实现])
type 接口参数类型 = 合并JSON插件结果<获得接口逻辑插件类型<typeof 接口实现>>
let _接口参数是逻辑参数: Eq<接口参数类型, 逻辑参数类型> = true

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 接口错误类型描述, 接口正确类型描述)
