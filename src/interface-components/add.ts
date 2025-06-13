import { JSON解析插件, 合并插件结果, 接口逻辑组件 } from '@lsby/net-core'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 插件类型 = [
  Task<
    JSON解析插件<
      z.ZodObject<{
        a: z.ZodNumber
        b: z.ZodNumber
      }>
    >
  >,
]
type 参数类型 = 合并插件结果<插件类型>
type 逻辑错误类型 = never
type 逻辑正确类型 = {
  res: number
}
type 附加参数类型 = {}

export class 加法接口组件 extends 接口逻辑组件<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override async 实现(参数: 参数类型, _附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    return new Right({ res: 参数.a + 参数.b })
  }
}
