import { Either, Left, Right } from '@lsby/ts-fp-data'
import { user } from '../../types/db'
import { 业务行为, 业务行为实现上下文, 兜底错误 } from '../base/base'

type 输入 = {
  用户: user
  输入密码: string
}
type 输出 = {}
type 错误 = typeof 兜底错误 | '密码错误'

export class 检查用户密码 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(ctx: 业务行为实现上下文, 参数: 输入): Promise<Either<错误, 输出>> {
    if (参数.用户.pwd == 参数.输入密码) return new Right({})
    return new Left('密码错误')
  }
}
