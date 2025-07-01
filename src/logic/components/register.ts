import { 接口逻辑 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { createHash, randomUUID } from 'crypto'

type user = {
  id: string
  name: string
  pwd: string
}

type 逻辑附加参数类型<用户名字段类型 extends string, 密码字段类型 extends string> = Record<用户名字段类型, string> &
  Record<密码字段类型, string>
type 逻辑错误类型 = '用户名已存在'
type 逻辑正确类型 = {}

export function 注册逻辑<
  用户名字段类型 extends string,
  密码字段类型 extends string,
  插件类型 extends [Task<Kysely插件<'kysely', { user: user }>>],
>(
  用户名字段名: 用户名字段类型,
  密码字段名: 密码字段类型,
  插件: [...插件类型],
): 接口逻辑<[...插件类型], 逻辑附加参数类型<用户名字段类型, 密码字段类型>, 逻辑错误类型, 逻辑正确类型> {
  return 接口逻辑.构造(插件, async (参数, 逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(注册逻辑.name)

    let 用户存在 = await 参数.kysely
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('name', '=', 逻辑附加参数[用户名字段名])
      .executeTakeFirst()
    if (用户存在 !== void 0) return new Left('用户名已存在')

    await 参数.kysely
      .获得句柄()
      .insertInto('user')
      .values({
        id: randomUUID(),
        name: 逻辑附加参数[用户名字段名],
        pwd: createHash('md5').update(逻辑附加参数[密码字段名]).digest('hex'),
      })
      .execute()

    return new Right({})
  })
}
