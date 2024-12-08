import { 业务行为 } from '@lsby/net-core'
import { Either, Left } from '@lsby/ts-fp-data'
import { Kysely } from 'kysely'
import { DB } from '../../types/db'
import { 检查用户存在 } from '../check/check-user-exist'
import { 检查用户密码 } from '../check/check-user-pwd'

type 输入 = {
  kysely: Kysely<DB>
  name: string
  pwd: string
  signJwt: (a: { userId: string }) => string
}
type 错误 =
  | '用户不存在'
  | '密码错误'
  | '用户名或密码不能包含空格'
  | '用户名或密码不能为空'
  | '用户名过短'
  | '用户名过长'
  | '密码过短'
  | '密码过长'
type 输出 = {
  token: string
}

export class 登录 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    if (参数.name.includes(' ')) return new Left('用户名或密码不能包含空格')
    if (参数.pwd.includes(' ')) return new Left('用户名或密码不能包含空格')
    if (参数.name === '') return new Left('用户名或密码不能为空')
    if (参数.pwd === '') return new Left('用户名或密码不能为空')
    if (参数.name.length < 5) return new Left('用户名过短')
    if (参数.name.length > 20) return new Left('用户名过长')
    if (参数.pwd.length < 6) return new Left('密码过短')
    if (参数.pwd.length > 32) return new Left('密码过长')

    let 结果 = await 业务行为
      .混合组合多项([new 检查用户存在(), new 检查用户密码()])
      .映射结果((a) => ({ token: 参数.signJwt({ userId: a.用户.id }) }))
      .运行业务行为({ kysely: 参数.kysely, 用户名: 参数.name, 输入密码: 参数.pwd })
    return 结果
  }
}
