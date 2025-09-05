import { 接口逻辑, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑错误类型 = never

export function 查询逻辑<
  表名类型 extends string,
  表结构zod类型 extends z.AnyZodObject,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  选择的字段们类型 extends keyof z.infer<表结构zod类型>,
  插件类型 extends Task<Kysely插件<'kysely', { [k in 表名类型]: z.infer<表结构zod类型> }>>,
>(opt: {
  表名: 表名类型
  表结构zod: 表结构zod类型
  计算参数: (data: 逻辑附加参数类型) => {
    选择的字段们: 选择的字段们类型[]
    当前页: number
    每页数量: number
    排序字段: keyof z.infer<表结构zod类型>
    排序模式: 'asc' | 'desc'
  }
  kysely插件: 插件类型
}): 接口逻辑<
  [插件类型],
  逻辑附加参数类型,
  逻辑错误类型,
  { list: Pick<z.infer<表结构zod类型>, 选择的字段们类型>[]; count: number }
> {
  return 接口逻辑.构造([opt.kysely插件], async (参数, 附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(查询逻辑.name)

    let 参数结果 = opt.计算参数(附加参数)
    if (参数结果.当前页 <= 0) throw new Error('当前页从1开始')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let kysely = 参数.kysely.获得句柄() as any

    let 查询总数 = (await kysely
      .selectFrom(opt.表名)
      .select((eb: any) => eb.fn.count(参数结果.排序字段).as('count'))
      .executeTakeFirst()) as { count: number }

    let rows = (await kysely
      .selectFrom(opt.表名)
      .select(参数结果.选择的字段们)
      .limit(参数结果.每页数量)
      .offset((参数结果.当前页 - 1) * 参数结果.每页数量)
      .orderBy(参数结果.排序字段, 参数结果.排序模式)
      .execute()) as Pick<z.infer<表结构zod类型>, 选择的字段们类型>[]

    return new Right({
      list: rows,
      count: 查询总数.count,
    })
  })
}
