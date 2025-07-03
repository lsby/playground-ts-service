import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  构造元组,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

let 接口路径 = '/api/demo/crud/get-list' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑.空逻辑().混合(
  接口逻辑.构造(
    构造元组([
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
    ]),
    async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)

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
    },
  ),
)

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  ),
  total: z.number(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
