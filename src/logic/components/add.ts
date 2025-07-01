import { JSON解析插件, 接口逻辑 } from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑附加参数类型 = {}
type 逻辑错误类型 = never
type 逻辑正确类型 = {
  res: number
}

export function 加法逻辑<
  A字段类型 extends string,
  B字段类型 extends string,
  插件类型 extends [Task<JSON解析插件<z.ZodObject<Record<A字段类型, z.ZodNumber> & Record<B字段类型, z.ZodNumber>>>>],
>(
  A字段名: A字段类型,
  B字段名: B字段类型,
  插件: [...插件类型],
): 接口逻辑<[...插件类型], 逻辑附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  return 接口逻辑.构造(插件, async (参数, _逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(加法逻辑.name)
    return new Right({ res: 参数[A字段名] + 参数[B字段名] })
  })
}
