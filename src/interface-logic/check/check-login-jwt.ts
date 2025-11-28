/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { JWT插件 } from '@lsby/net-core-jwt'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Left, Right } from '@lsby/ts-fp-data'
import { ZodObject, ZodString, ZodUndefined, ZodUnion } from 'zod'
import { 从插件类型计算DB, 安全的any } from '../../tools/types'

type 逻辑错误类型 = '未登录'

export class 检查登录<
  表名类型 extends keyof DB,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  插件类型 extends [
    JWT插件<ZodObject<{ userId: ZodUnion<[ZodString, ZodUndefined]> }>>['解析器'],
    Kysely插件<'kysely', { [k in 表名类型]: DB[表名类型] }>,
  ],
  DB = 从插件类型计算DB<插件类型[1]>,
> extends 接口逻辑<插件类型, 逻辑附加参数类型, 逻辑错误类型, { userId: string }> {
  public constructor(
    private 插件们: 插件类型,
    private 计算参数: (data: 逻辑附加参数类型) => {
      表名: 表名类型
      id字段: keyof DB[表名类型]
    },
  ) {
    super()
  }

  public override 获得插件们(): 插件类型 {
    return this.插件们
  }
  public override async 实现(
    参数: 合并插件结果<插件类型>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<逻辑错误类型, { userId: string }>> {
    let _log = 请求附加参数.log.extend(检查登录.name)

    let userId = 参数.userId ?? null
    if (userId === null) return new Left('未登录')

    let 参数结果 = this.计算参数(逻辑附加参数)

    let 存在确认 = await (参数.kysely.获得句柄() as 安全的any)
      .selectFrom(参数结果.表名)
      .select(参数结果.id字段)
      .where(参数结果.id字段, '=', userId)
      .executeTakeFirst()
    if (存在确认 === void 0) return new Left('未登录')

    return new Right({ userId: userId })
  }
}
