import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  构造元组,
  构造对象,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 加法逻辑 } from '../../../../interfece-logic/components/add'

let 接口路径 = '/api/demo/base/add' as const
let 接口方法 = 'post' as const

let 接口实现 = 接口逻辑.空逻辑().混合(
  加法逻辑(
    'a',
    'b',
    构造元组([
      new Task(async () => {
        return new JSON解析插件(z.object({ ...构造对象('a', z.number()), ...构造对象('b', z.number()) }), {})
      }),
    ]),
  ),
)

type _接口JSON参数 = 计算接口逻辑JSON参数<typeof 接口实现>
type _接口错误返回 = 计算接口逻辑错误结果<typeof 接口实现>
type _接口正确返回 = 计算接口逻辑正确结果<typeof 接口实现>

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({
  res: z.number(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 接口错误类型描述, 接口正确类型描述)
