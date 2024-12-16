import { 业务行为 } from '@lsby/net-core'
import { Either, Left, Right } from '@lsby/ts-fp-data'
import { createHash, randomUUID } from 'crypto'
import { Kysely } from 'kysely'
import { DB } from '../../types/db'
import { 查找用户 } from './find-user'

type 输入 = {
  kysely: Kysely<DB>
  name: string
  pwd: string
}
type 错误 =
  | '用户名已存在'
  | '用户名或密码不能包含空格'
  | '用户名或密码不能为空'
  | '用户名过短'
  | '用户名过长'
  | '密码过短'
  | '密码过长'
type 输出 = {}

export class 注册 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    if (参数.name.includes(' ')) return new Left('用户名或密码不能包含空格')
    if (参数.pwd.includes(' ')) return new Left('用户名或密码不能包含空格')
    if (参数.name === '') return new Left('用户名或密码不能为空')
    if (参数.pwd === '') return new Left('用户名或密码不能为空')
    if (参数.name.length < 5) return new Left('用户名过短')
    if (参数.name.length > 20) return new Left('用户名过长')
    if (参数.pwd.length < 6) return new Left('密码过短')
    if (参数.pwd.length > 32) return new Left('密码过长')

    let 用户存在 = (await new 查找用户().运行业务行为({ kysely: 参数.kysely, 用户名: 参数.name }))
      .assertRight()
      .getRight()
    if (用户存在.用户 !== null) return new Left('用户名已存在')

    await 参数.kysely
      .insertInto('user')
      .values({ id: randomUUID(), name: 参数.name, pwd: createHash('md5').update(参数.pwd).digest('hex') })
      .execute()

    return new Right({})
  }
}
