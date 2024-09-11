import { randomUUID } from 'crypto'
import { API接口, 包装的正确JSON结果, 包装的错误JSON结果, 计算实现参数, 计算实现结果 } from '@lsby/net-core'
import { Either, Left, Right } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 业务行为, 业务行为实现上下文 } from '../../../model/abstract/action'
import API类型定义, { 输入, 输出, 错误 } from './type'

export class 注册 extends 业务行为<输入, 错误, 输出> implements API接口<typeof API类型定义> {
  protected override async 业务行为实现(ctx: 业务行为实现上下文, 参数: 输入): Promise<Either<错误, 输出>> {
    var 用户存在 = await ctx.kesely.selectFrom('user').select('id').where('name', '=', 参数.name).executeTakeFirst()
    if (用户存在) return new Left('用户名已存在')
    await ctx.kesely.insertInto('user').values({ id: randomUUID(), name: 参数.name, pwd: 参数.pwd }).execute()
    return new Right({})
  }

  获得API类型(): typeof API类型定义 {
    return API类型定义
  }

  async API实现(ctx: 计算实现参数<typeof API类型定义>): 计算实现结果<typeof API类型定义> {
    var kysely = (await Global.getItem('kysely')).获得句柄()
    var r = await this.运行业务行为(kysely, { ...ctx.body })
    if (r.isLeft()) return new 包装的错误JSON结果(r.getLeft())
    return new 包装的正确JSON结果(r.assertRight().getRight())
  }
}

export default new 注册()
