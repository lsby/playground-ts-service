import { 合并插件结果, 接口逻辑组件 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { SelectExpression, Selection, Simplify } from 'kysely'

type ExtractTableAlias<DB, TE> = TE extends `${string} as ${infer TA}`
  ? TA extends keyof DB
    ? TA
    : never
  : TE extends keyof DB
    ? TE
    : never

type 插件类型<表类型, 表名称 extends keyof 表类型> = [Task<Kysely插件<'kysely', Record<表名称, 表类型[表名称]>>>]
type 参数类型<表类型, 表名称 extends keyof 表类型> = 合并插件结果<插件类型<表类型, 表名称>>
type 逻辑错误类型 = never
type 逻辑正确类型<
  表类型,
  表名称 extends keyof 表类型,
  选择列 extends SelectExpression<
    Record<表名称, 表类型[表名称]>,
    ExtractTableAlias<Record<表名称, 表类型[表名称]>, 表名称>
  >[],
> = {
  list: Simplify<
    Selection<Record<表名称, 表类型[表名称]>, ExtractTableAlias<Record<表名称, 表类型[表名称]>, 表名称>, 选择列[number]>
  >[]
}
type 附加参数类型 = {}

export class 表查询组件<
  输入类型 extends [Task<Kysely插件<'kysely', any>>],
  表名称 extends keyof 表类型 & string,
  选择列 extends SelectExpression<
    Record<表名称, 表类型[表名称]>,
    ExtractTableAlias<Record<表名称, 表类型[表名称]>, 表名称>
  >[],
  表类型 = 输入类型 extends [Task<Kysely插件<'kysely', infer x>>] ? x : never,
> extends 接口逻辑组件<插件类型<表类型, 表名称>, 附加参数类型, 逻辑错误类型, 逻辑正确类型<表类型, 表名称, 选择列>> {
  constructor(
    插件们: [...输入类型],
    private opt: { 表名称: 表名称; 查询列: [...选择列] },
  ) {
    super(插件们)
  }

  override async 实现(
    参数: 参数类型<表类型, 表名称>,
    _附加参数: 附加参数类型,
  ): Promise<Either<逻辑错误类型, 逻辑正确类型<表类型, 表名称, 选择列>>> {
    let 查询结果 = await 参数.kysely.获得句柄().selectFrom(this.opt.表名称).select(this.opt.查询列).execute()
    return new Right({ list: 查询结果 })
  }
}
