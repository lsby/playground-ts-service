/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { 从插件类型计算DB, 条件 } from '../../types/types'

export class 查询逻辑<
  表名类型 extends keyof DB,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  选择的字段们类型 extends keyof DB[表名类型],
  插件类型 extends Task<Kysely插件<'kysely', { [k in 表名类型]: DB[表名类型] }>>,
  DB = 从插件类型计算DB<插件类型>,
> extends 接口逻辑<
  [插件类型],
  逻辑附加参数类型,
  never,
  { data: Pick<DB[表名类型], 选择的字段们类型>[]; total: number }
> {
  public constructor(
    private kysely插件: 插件类型,
    private 计算参数: (data: 逻辑附加参数类型) => Promise<{
      表名: 表名类型
      选择的字段们: 选择的字段们类型[]
      当前页: number
      每页数量: number
      排序字段: keyof DB[表名类型]
      排序模式?: 'asc' | 'desc'
      条件们?: 条件<DB[表名类型]>[]
    }>,
  ) {
    super()
  }

  public override 获得插件们(): [插件类型] {
    return [this.kysely插件]
  }
  public override async 实现(
    参数: 合并插件结果<[插件类型]>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<never, { data: Pick<DB[表名类型], 选择的字段们类型>[]; total: number }>> {
    let _log = 请求附加参数.log.extend(查询逻辑.name)

    let 参数结果 = await this.计算参数(逻辑附加参数)
    if (参数结果.当前页 <= 0) throw new Error('当前页从1开始')
    参数结果.排序模式 = 参数结果.排序模式 ?? 'asc'

    let kysely = 参数.kysely.获得句柄() as any

    let builder总数 = kysely.selectFrom(参数结果.表名).select((eb: any) => eb.fn.count(参数结果.排序字段).as('total'))
    let builder数据 = kysely
      .selectFrom(参数结果.表名)
      .select(参数结果.选择的字段们)
      .limit(参数结果.每页数量)
      .offset((参数结果.当前页 - 1) * 参数结果.每页数量)
      .orderBy(参数结果.排序字段, 参数结果.排序模式)

    if (参数结果.条件们 !== void 0 && 参数结果.条件们.length > 0) {
      for (let 条件 of 参数结果.条件们) {
        switch (条件[1]) {
          case '=':
          case '!=':
          case '>':
          case '>=':
          case '<':
          case '<=':
            builder总数 = builder总数.where(条件[0], 条件[1], 条件[2])
            builder数据 = builder数据.where(条件[0], 条件[1], 条件[2])
            break
          case 'like':
            builder总数 = builder总数.where(条件[0], 'like', 条件[2])
            builder数据 = builder数据.where(条件[0], 'like', 条件[2])
            break
          case 'in':
            builder总数 = builder总数.where(条件[0], 'in', 条件[2])
            builder数据 = builder数据.where(条件[0], 'in', 条件[2])
            break
          case 'between':
            builder总数 = builder总数.where(条件[0], 'between', 条件[2])
            builder数据 = builder数据.where(条件[0], 'between', 条件[2])
            break
        }
      }
    }

    let 查询总数 = (await builder总数.executeTakeFirst()) as { total: number }
    let 查询数据 = (await builder数据.execute()) as Pick<DB[表名类型], 选择的字段们类型>[]

    return new Right({
      data: 查询数据,
      total: 查询总数.total,
    })
  }
}
