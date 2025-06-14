import { JSON解析插件, 去除只读, 合并插件结果, 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 登录检查器, 登录检查器正确类型 } from '../../action/check-login'

let 接口路径 = '/api/demo/sub' as const
let 接口方法 = 'post' as const

let 插件 = [
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
] as const
type 插件类型 = 去除只读<typeof 插件>

type 参数类型 = 合并插件结果<插件类型>
type 附加参数类型 = 登录检查器正确类型

let 逻辑错误类型Zod = z.enum(['未登录'])
let 逻辑正确类型Zod = z.object({
  res: z.number(),
})
type 逻辑错误类型 = z.infer<typeof 逻辑错误类型Zod>
type 逻辑正确类型 = z.infer<typeof 逻辑正确类型Zod>

class 逻辑实现 extends 接口逻辑<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(参数: 参数类型, _附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let _log = (await Global.getItem('log')).extend(接口路径)

    return new Right({ res: 参数.a - 参数.b })
  }
}
let 接口实现 = 接口逻辑.混合([new 登录检查器(), new 逻辑实现()])

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 逻辑错误类型Zod, 逻辑正确类型Zod)
