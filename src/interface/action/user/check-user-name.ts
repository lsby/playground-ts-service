import { JSON解析插件, 去除只读, 合并插件结果, 接口逻辑 } from '@lsby/net-core'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

let 插件 = [
  new Task(async () => {
    return new JSON解析插件(
      z.object({
        userName: z.string(),
      }),
      {},
    )
  }),
] as const
type 插件类型 = 去除只读<typeof 插件>

export type 检查用户名错误类型 = '用户名不能包含空格' | '用户名不能为空' | '用户名过短' | '用户名过长'
export type 检查用户名正确类型 = { userName: string }

type 附加参数类型 = {}
export class 检查用户名 extends 接口逻辑<插件类型, 附加参数类型, 检查用户名错误类型, 检查用户名正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(
    参数: 合并插件结果<插件类型>,
    _附加参数: 附加参数类型,
  ): Promise<Either<检查用户名错误类型, 检查用户名正确类型>> {
    if (参数.userName.includes(' ')) return new Left('用户名不能包含空格')
    if (参数.userName === '') return new Left('用户名不能为空')
    if (参数.userName.length < 5) return new Left('用户名过短')
    if (参数.userName.length > 20) return new Left('用户名过长')
    return new Right({ userName: 参数.userName })
  }
}
