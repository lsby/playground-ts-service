import { 业务行为 } from '@lsby/net-core'
import { Either, Right } from '@lsby/ts-fp-data'
import { Kysely } from 'kysely'
import { DB } from '../../types/db'

type 输入 = {
  kysely: Kysely<DB>
  userId?: string | undefined
}
type 错误 = never
type 输出 = {
  isLogin: boolean
}

export class 用户已登录 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    let userId = 参数.userId ?? null
    if (userId === null) return new Right({ isLogin: false })
    let 用户存在确认 =
      (await 参数.kysely.selectFrom('user').select('id').where('user.id', '=', userId).executeTakeFirst()) ?? null
    if (用户存在确认 === null) return new Right({ isLogin: false })
    return new Right({ isLogin: true })
  }
}
