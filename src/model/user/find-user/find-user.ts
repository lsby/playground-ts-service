import { z } from 'zod'
import { 业务行为 } from '@lsby/net-core'
import { Either, Right } from '@lsby/ts-fp-data'
import { 输入描述, 输出描述, 错误描述 } from './type'

type 输入 = z.infer<typeof 输入描述>
type 输出 = z.infer<typeof 输出描述>
type 错误 = z.infer<typeof 错误描述>

export class 查找用户 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    var user = await 参数.kysely
      .selectFrom('user')
      .select(['id', 'name', 'pwd'])
      .where('name', '=', 参数.用户名)
      .executeTakeFirst()
    if (user == null) return new Right({ 用户: null })
    return new Right({ 用户: user })
  }
}
