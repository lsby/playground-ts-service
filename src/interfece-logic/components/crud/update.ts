import { 接口逻辑, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 更新逻辑错误类型 = never

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
    条件: Partial<z.infer<表结构zod类型>>
    更新数据: 更新字段们类型
  }
  kysely插件: 插件类型
}): 接口逻辑<[插件类型], 逻辑附加参数类型, 更新逻辑错误类型, {}> {
  return 接口逻辑.构造([opt.kysely插件], async (参数, 附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(更新逻辑.name)

    let 参数结果 = opt.计算参数(附加参数)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let kysely = 参数.kysely.获得句柄() as any

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    await kysely
      .updateTable(opt.表名)
      .set(参数结果.更新数据)
      .where((eb: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let cond: any = eb.and(...Object.entries(参数结果.条件).map(([k, v]) => eb(k, '=', v)))
        return cond
      })
      .executeTakeFirst()

    return new Right({})
  })
}
