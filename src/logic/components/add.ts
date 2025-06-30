import { JSON解析插件, 合并插件结果, 接口逻辑组件, 请求附加参数类型 } from '@lsby/net-core'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑插件类型 = [
  Task<
    JSON解析插件<
      z.ZodObject<{
        a: z.ZodNumber
        b: z.ZodNumber
      }>
    >
  >,
]
type 逻辑参数类型 = 合并插件结果<逻辑插件类型>
type 逻辑附加参数类型 = {}

type 逻辑错误类型 = never
type 逻辑正确类型 = {
  res: number
}

class 逻辑实现 extends 接口逻辑组件<逻辑插件类型, 逻辑附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override async 实现(
    参数: 逻辑参数类型,
    附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let _log = 请求附加参数.log.extend('加法逻辑')
    return new Right({ res: 参数.a + 参数.b })
  }
}

export let 加法逻辑 = 逻辑实现
