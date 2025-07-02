import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  构造元组,
  构造对象,
  计算接口逻辑JSON参数,
  计算接口逻辑参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 登录检查器 } from '../../../../interfece-logic/check/check-login'

let 接口路径 = '/api/demo/base/sub' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(登录检查器())
  .混合(
    接口逻辑.构造(
      构造元组([
        new Task(async () => {
          return new JSON解析插件(z.object({ ...构造对象('a', z.number()), ...构造对象('b', z.number()) }), {})
        }),
      ]),
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        return new Right({ res: 参数.a - 参数.b })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑完整参数 = 计算接口逻辑参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录'])
let 接口正确类型描述 = z.object({
  res: z.number(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
