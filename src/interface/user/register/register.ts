import { randomUUID } from 'crypto'
import { JSON状态接口, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Left, Right } from '@lsby/ts-fp-data'
import { 查找用户 } from '../find-user/find-user'
import { 接口描述 } from './type'

type 接口描述类型 = typeof 接口描述

export class 注册 extends JSON状态接口<接口描述类型> {
  override 获得JSON接口类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var 用户存在 = (await new 查找用户().运行业务行为({ kysely: 参数.kysely, 用户名: 参数.name }))
      .assertRight()
      .getRight()
    if (用户存在.用户) return new Left('用户名已存在')
    await 参数.kysely.insertInto('user').values({ id: randomUUID(), name: 参数.name, pwd: 参数.pwd }).execute()
    return new Right({})
  }
}
