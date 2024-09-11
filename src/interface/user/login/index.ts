import { API接口基类, 包装的正确JSON结果, 包装的错误JSON结果, 计算实现参数, 计算实现结果 } from '@lsby/net-core'
import { Either } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 业务行为, 业务行为实现上下文 } from '../../../model/abstract/action'
import { 检查用户密码 } from '../../../model/action/check-user-pwd'
import { 查找用户 } from '../../../model/action/find-user'
import API类型定义, { 输入, 输出, 错误 } from './type'

export class 登录 extends 业务行为<输入, 错误, 输出> implements API接口基类<typeof API类型定义> {
  protected override async 业务行为实现(ctx: 业务行为实现上下文, 参数: 输入): Promise<Either<错误, 输出>> {
    var 查找用户行为 = new 查找用户()
    var 验证密码行为 = new 检查用户密码()
    var 最终行为 = 业务行为.混合组合多项([查找用户行为, 验证密码行为]).映射结果((a) => ({ 用户id: a.用户.id }))
    return 最终行为.运行业务行为(ctx.kesely, { 用户名: 参数.name, 输入密码: 参数.pwd })
  }

  获得API类型(): typeof API类型定义 {
    return API类型定义
  }

  async API实现(ctx: 计算实现参数<typeof API类型定义>): 计算实现结果<typeof API类型定义> {
    var kysely = (await Global.getItem('kysely')).获得句柄()
    var r = await this.运行业务行为(kysely, { ...ctx.body })
    if (r.isLeft()) return new 包装的错误JSON结果(r.getLeft())
    return new 包装的正确JSON结果({ token: ctx.signJwt({ userId: r.assertRight().getRight().用户id }) })
  }
}

export default new 登录()
