import { 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

export class 检查唯一性<
  表名类型 extends string,
  表结构zod类型 extends z.AnyZodObject,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  错误信息类型 extends string,
  数据库字段名类型 extends keyof z.infer<表结构zod类型>,
  参数字段名类型 extends keyof 逻辑附加参数类型,
  插件类型 extends Task<Kysely插件<'kysely', { [K in 表名类型]: z.infer<表结构zod类型> }>>,
> extends 接口逻辑<[插件类型], 逻辑附加参数类型, 错误信息类型, {}> {
  public constructor(
    private opt: {
      表名: 表名类型
      表结构zod: 表结构zod类型
      数据库字段名: 数据库字段名类型
      参数字段名: 参数字段名类型
      错误信息: 错误信息类型
      kysely插件: 插件类型
    },
  ) {
    super()
  }

  public override 获得插件们(): [插件类型] {
    return [this.opt.kysely插件]
  }

  public override async 实现(
    参数: 合并插件结果<[插件类型]>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<错误信息类型, {}>> {
    let _log = 请求附加参数.log.extend(检查唯一性.name)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let 已存在 = await (参数.kysely.获得句柄() as any)
      .selectFrom(this.opt.表名)
      .select(this.opt.数据库字段名)
      .where(this.opt.数据库字段名, '=', 逻辑附加参数[this.opt.参数字段名])
      .executeTakeFirst()

    if (已存在 !== void 0) {
      return new Left(this.opt.错误信息)
    }

    return new Right({})
  }
}
