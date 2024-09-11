import { Either, Left, Right } from '@lsby/ts-fp-data'
import { user } from '../../types/db'
import { 业务行为, 业务行为实现上下文, 兜底错误 } from '../abstract/action'

type 输入 = {
  用户名: string
}
type 输出 = {
  用户: user
}
type 错误 = typeof 兜底错误 | '用户不存在'

export class 查找用户 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(ctx: 业务行为实现上下文, 参数: 输入): Promise<Either<错误, 输出>> {
    var user = await ctx.kesely
      .selectFrom('user')
      .select(['id', 'name', 'pwd'])
      .where('name', '=', 参数.用户名)
      .executeTakeFirst()
    if (user == null) return new Left('用户不存在')
    return new Right({ 用户: user })
  }
}
