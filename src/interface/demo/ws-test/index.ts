import {
  WebSocket插件,
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
import { Global } from '../../../global/global'

let 接口路径 = '/api/demo/ws-test' as const
let 接口方法 = 'post' as const

let 插件 = [
  new Task(async () => {
    return new WebSocket插件(
      z.object({
        data: z.string(),
      }),
    )
  }),
] as const

let 逻辑错误类型Zod = z.never()
let 逻辑正确类型Zod = z.object({})

type 附加参数类型 = {}
class 逻辑实现 extends 接口逻辑<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(参数: 参数类型, _附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let _log = (await Global.getItem('log')).extend(接口路径)

    let 数据 = ['你', '好', '世', '界']
    let 当前索引 = 0

    let 定时器句柄 = setInterval(async () => {
      let 当前数据 = 数据[当前索引]
      当前索引++
      if (当前数据 === void 0) {
        clearInterval(定时器句柄)
        await 参数.ws操作?.关闭ws连接()
        return
      }
      await 参数.ws操作?.发送ws信息({ data: 当前数据 }).catch(() => {})
    }, 1000)

    return new Right({})
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
