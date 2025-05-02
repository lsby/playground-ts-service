import {
  JSON解析插件,
  去除只读,
  合并插件结果,
  常用形式转换器,
  接口,
  接口逻辑,
  获得接口逻辑正确类型,
  获得接口逻辑错误类型,
} from '@lsby/net-core'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

let 接口路径 = '/api/demo/get-list' as const
let 接口方法 = 'post' as const

let 插件 = [
  new Task(
    async () =>
      new JSON解析插件(
        z.object({
          page: z.number().min(1),
          size: z.number().min(1),
        }),
        {},
      ),
  ),
] as const

let 逻辑错误类型Zod = z.never()
let 逻辑正确类型Zod = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  ),
  total: z.number(),
})

type 附加参数类型 = {}
class 逻辑实现 extends 接口逻辑<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(参数: 参数类型, _附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let 全部数据 = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      value: `Value-${i + 1}`,
    }))
    let 开始 = (参数.page - 1) * 参数.size
    let 分页数据 = 全部数据.slice(开始, 开始 + 参数.size)
    return new Right({
      data: 分页数据,
      total: 全部数据.length,
    })
  }
}

let 接口实现 = 接口逻辑.混合([new 逻辑实现()])

type 插件类型 = 去除只读<typeof 插件>
type 参数类型 = 合并插件结果<插件类型>
type 逻辑错误类型 = z.infer<typeof 逻辑错误类型Zod>
type 逻辑正确类型 = z.infer<typeof 逻辑正确类型Zod>
let 接口错误输出形式 = z.object({ status: z.literal('fail'), data: 逻辑错误类型Zod })
let 接口正确输出形式 = z.object({ status: z.literal('success'), data: 逻辑正确类型Zod })
let 接口转换器 = new 常用形式转换器<获得接口逻辑错误类型<typeof 接口实现>, 获得接口逻辑正确类型<typeof 接口实现>>()

export default new 接口(接口路径, 接口方法, 接口实现, 接口错误输出形式, 接口正确输出形式, 接口转换器)
