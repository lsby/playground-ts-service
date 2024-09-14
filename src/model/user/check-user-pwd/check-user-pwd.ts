import { z } from 'zod'
import { 业务行为 } from '@lsby/net-core'
import { Either, Left, Right } from '@lsby/ts-fp-data'
import { 输入形状, 输出形状, 错误形状 } from './type'

type 输入 = z.infer<typeof 输入形状>
type 输出 = z.infer<typeof 输出形状>
type 错误 = z.infer<typeof 错误形状>

export class 检查用户密码 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    if (参数.用户.pwd == 参数.输入密码) return new Right({})
    return new Left('密码错误')
  }
}
