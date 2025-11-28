/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Right } from '@lsby/ts-fp-data'
import { undefined加可选, 从插件类型计算DB, 安全的any, 替换ColumnType } from '../../tools/types'

export class 注册逻辑<
  表名类型 extends keyof DB,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  插件类型 extends Kysely插件<'kysely', { [k in 表名类型]: DB[表名类型] }>,
  DB = 从插件类型计算DB<插件类型>,
> extends 接口逻辑<[插件类型], 逻辑附加参数类型, never, {}> {
  public constructor(
    private kysely插件: 插件类型,
    private 表名: 表名类型,
    private 计算数据: (data: 逻辑附加参数类型) => Promise<undefined加可选<替换ColumnType<DB[表名类型], '__insert__'>>>,
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
  ): Promise<Either<never, {}>> {
    let _log = 请求附加参数.log.extend(注册逻辑.name)

    await (参数.kysely.获得句柄() as 安全的any)
      .insertInto(this.表名)
      .values(await this.计算数据(逻辑附加参数))
      .executeTakeFirst()

    return new Right({})
  }
}
