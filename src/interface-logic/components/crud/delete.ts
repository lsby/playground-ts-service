import { 合并插件正确结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Right } from '@lsby/ts-fp-data'
import { 从插件类型计算DB, 已审阅的any, 条件 } from '../../../tools/types'

export class 删除逻辑<
  表名类型 extends keyof DB,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  插件类型 extends Kysely插件<'kysely', { [k in 表名类型]: DB[表名类型] }>,
  DB = 从插件类型计算DB<插件类型>,
> extends 接口逻辑<[插件类型], 逻辑附加参数类型, never, {}> {
  public constructor(
    private kysely插件: 插件类型,
    private 表名: 表名类型,
    private 计算参数: (data: 逻辑附加参数类型) => Promise<{ 条件们: 条件<DB[表名类型]>[] }>,
  ) {
    super()
  }

  public override 获得插件们(): [插件类型] {
    return [this.kysely插件]
  }
  public override async 实现(
    参数: 合并插件正确结果<[插件类型]>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<never, {}>> {
    let _log = 请求附加参数.log.extend(删除逻辑.name)

    let 参数结果 = await this.计算参数(逻辑附加参数)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let 构造 = (参数.kysely.获得句柄() as 已审阅的any).deleteFrom(this.表名)
    if (参数结果.条件们.length > 0) {
      for (let 条件 of 参数结果.条件们) {
        switch (条件[1]) {
          case '=':
          case '!=':
          case '>':
          case '>=':
          case '<':
          case '<=':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            构造 = 构造.where(条件[0], 条件[1], 条件[2])
            break
          case 'like':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            构造 = 构造.where(条件[0], 'like', 条件[2])
            break
          case 'in':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            构造 = 构造.where(条件[0], 'in', 条件[2])
            break
          case 'between':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            构造 = 构造.where(条件[0], 'between', 条件[2])
            break
        }
      }
    }
    await 构造.executeTakeFirst()

    return new Right({})
  }
}
