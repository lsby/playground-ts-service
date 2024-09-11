import { Either, Right } from '@lsby/ts-fp-data'
import { user } from '../../types/db'
import { 业务行为, 业务行为实现上下文, 兜底错误 } from '../abstract/action'

type 输入 = {
  用户: user
  签名函数: (a: { userId: string }) => string
}
type 输出 = {
  签名: string
}
type 错误 = typeof 兜底错误

export class 签名用户id extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(ctx: 业务行为实现上下文, 参数: 输入): Promise<Either<错误, 输出>> {
    return new Right({ 签名: 参数.签名函数({ userId: 参数.用户.id }) })
  }
}
