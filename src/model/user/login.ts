import { Kysely } from 'kysely'
import { 业务行为, 计算业务行为参数 } from '@lsby/net-core'
import { Either } from '@lsby/ts-fp-data'
import { DB, user } from '../../types/db'
import { 检查用户密码 } from './check-user-pwd'
import { 查找用户 } from './find-user'

type 输入 = {
  kysely: Kysely<DB>
  name: string
  pwd: string
  signJwt: (a: { userId: string }) => string
}
type 错误 = '用户不存在' | '密码错误'
type 输出 = {
  token: string
}

export class 登录 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    var 查找用户行为 = new 查找用户().绑定<计算业务行为参数<查找用户>, '用户不存在', { 用户: user }>((a) => {
      return a.用户 ? 业务行为.通过正确值构造({ 用户: a.用户 }) : 业务行为.通过错误值构造('用户不存在')
    })
    var 验证密码行为 = new 检查用户密码()
    var 最终行为 = 业务行为
      .混合组合多项([查找用户行为, 验证密码行为])
      .映射结果((a) => ({ token: 参数.signJwt({ userId: a.用户.id }) }))
    var 最终结果 = await 最终行为.运行业务行为({ kysely: 参数.kysely, 用户名: 参数.name, 输入密码: 参数.pwd })
    return 最终结果
  }
}
