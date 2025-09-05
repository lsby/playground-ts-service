import { 接口逻辑, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑错误类型 = never

export function 新增逻辑<
  表名类型 extends string,
  表结构zod类型 extends z.AnyZodObject,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  插件类型 extends Task<Kysely插件<'kysely', { [k in 表名类型]: z.infer<表结构zod类型> }>>,
>(opt: {
  表名: 表名类型
  表结构zod: 表结构zod类型
  生成新增数据: (data: 逻辑附加参数类型) => z.infer<表结构zod类型>
  kysely插件: 插件类型
}): 接口逻辑<[插件类型], 逻辑附加参数类型, 逻辑错误类型, z.infer<表结构zod类型>> {
  return 接口逻辑.构造([opt.kysely插件], async (参数, 附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(新增逻辑.name)

    let 新增数据 = opt.生成新增数据(附加参数)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let kysely = 参数.kysely.获得句柄() as any
    await kysely.insertInto(opt.表名).values(新增数据).execute()

    return new Right(新增数据)
  })
}
