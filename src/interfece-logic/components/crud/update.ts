/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { 接口逻辑, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 条件 } from './_type'

export function 更新逻辑<
  表名类型 extends string,
  表结构zod类型 extends z.AnyZodObject,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  更新字段们类型 extends Partial<z.infer<表结构zod类型>>,
  插件类型 extends Task<Kysely插件<'kysely', { [k in 表名类型]: z.infer<表结构zod类型> }>>,
>(opt: {
  表名: 表名类型
  表结构zod: 表结构zod类型
  计算参数: (data: 逻辑附加参数类型) => {
    条件们: 条件<z.infer<表结构zod类型>>[]
    更新数据: 更新字段们类型
  }
  kysely插件: 插件类型
}): 接口逻辑<[插件类型], 逻辑附加参数类型, never, {}> {
  return 接口逻辑.构造([opt.kysely插件], async (参数, 附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(更新逻辑.name)

    let 参数结果 = opt.计算参数(附加参数)

    let kysely = 参数.kysely.获得句柄() as any
    let 构造 = kysely.updateTable(opt.表名).set(参数结果.更新数据)

    if (参数结果.条件们.length > 0) {
      for (let 条件 of 参数结果.条件们) {
        switch (条件[1]) {
          case '=':
          case '!=':
          case '>':
          case '>=':
          case '<':
          case '<=':
            构造 = 构造.where(条件[0], 条件[1], 条件[2])
            break
          case 'like':
            构造 = 构造.where(条件[0], 'like', 条件[2])
            break
          case 'in':
            构造 = 构造.where(条件[0], 'in', 条件[2])
            break
          case 'between':
            构造 = 构造.where(条件[0], 'between', 条件[2])
            break
        }
      }
    }
    await 构造.executeTakeFirst()

    return new Right({})
  })
}
