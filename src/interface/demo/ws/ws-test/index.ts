import {
  WebSocket插件,
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { z } from 'zod'

let 接口路径 = '/api/demo/ws/ws-test' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑.空逻辑().混合(
  接口逻辑.构造(
    [new WebSocket插件(z.object({ data: z.string() }))],
    async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)

      let 数据 = ['你', '好', '世', '界']
      let 当前索引 = 0

      let 定时器句柄 = setInterval(async () => {
        let 当前数据 = 数据[当前索引]
        当前索引++
        if (当前数据 === void 0) {
          clearInterval(定时器句柄)
          return
        }
        await 参数.ws操作?.发送ws信息({ data: 当前数据 }).catch(() => {})
      }, 1000)

      return new Right({})
    },
    async (参数) => {
      await 参数.ws操作?.关闭ws连接()
    },
  ),
)

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
