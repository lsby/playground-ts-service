import { 合并插件结果, 接口逻辑组件 } from '@lsby/net-core'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { createHash, randomUUID } from 'crypto'

type user = {
  id: string
  name: string
  pwd: string
}

type 插件类型 = [Task<Kysely插件<'kysely', { user: user }>>]
type 参数类型 = 合并插件结果<插件类型>
type 逻辑错误类型 = '用户名已存在'
type 逻辑正确类型 = {}
type 附加参数类型 = { userName: string; userPassword: string }

export class 注册接口组件 extends 接口逻辑组件<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override async 实现(参数: 参数类型, 附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let 用户存在 = await 参数.kysely
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('name', '=', 附加参数.userName)
      .executeTakeFirst()
    if (用户存在 !== void 0) return new Left('用户名已存在')

    await 参数.kysely
      .获得句柄()
      .insertInto('user')
      .values({
        id: randomUUID(),
        name: 附加参数.userName,
        pwd: createHash('md5').update(附加参数.userPassword).digest('hex'),
      })
      .execute()

    return new Right({})
  }
}
