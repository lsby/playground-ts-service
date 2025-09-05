import { 接口逻辑, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

export function 检查唯一性<
  表名类型 extends string,
  表结构zod类型 extends z.AnyZodObject,
  逻辑附加参数类型 extends 接口逻辑附加参数类型,
  错误信息类型 extends string,
  数据库字段名类型 extends keyof z.infer<表结构zod类型>,
  字段类型 extends keyof 逻辑附加参数类型,
  插件类型 extends Task<Kysely插件<'kysely', { [K in 表名类型]: z.infer<表结构zod类型> }>>,
>(opt: {
  表名: 表名类型
  表结构zod: 表结构zod类型
  数据库字段名: 数据库字段名类型
  参数字段名: 字段类型
  错误信息: 错误信息类型
  kysely插件: 插件类型
}): 接口逻辑<[插件类型], 逻辑附加参数类型, typeof opt.错误信息, {}> {
  return 接口逻辑.构造([opt.kysely插件], async (参数, 附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(检查唯一性.name)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let 已存在 = await (参数.kysely.获得句柄() as any)
      .selectFrom(opt.表名)
      .select(opt.数据库字段名)
      .where(opt.数据库字段名, '=', 附加参数[opt.参数字段名])
      .executeTakeFirst()

    if (已存在 !== void 0) {
      return new Left(opt.错误信息 as typeof opt.错误信息)
    }

    return new Right({})
  })
}
