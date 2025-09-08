import { 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { undefined加可选, 从插件类型计算DB, 替换ColumnType } from '../../types/types'

export class 新增逻辑<
  表名类型 extends keyof DB,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  插件类型 extends Task<Kysely插件<'kysely', { [k in 表名类型]: DB[表名类型] }>>,
  DB = 从插件类型计算DB<插件类型>,
> extends 接口逻辑<[插件类型], 逻辑附加参数类型, never, {}> {
  public constructor(
    private kysely插件: 插件类型,
    private 计算参数: (data: 逻辑附加参数类型) => Promise<{
      表名: 表名类型
      数据: undefined加可选<替换ColumnType<DB[表名类型], '__insert__'>>
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
  ): Promise<Either<never, {}>> {
    let _log = 请求附加参数.log.extend(新增逻辑.name)

    let 参数结果 = await this.计算参数(逻辑附加参数)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let kysely = 参数.kysely.获得句柄() as any
    await kysely.insertInto(参数结果.表名).values(参数结果.数据).executeTakeFirst()

    return new Right({})
  }
}
