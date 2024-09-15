import { JSON状态接口, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { 接口描述 } from './type'

type 接口描述类型 = typeof 接口描述

export class 查找用户 extends JSON状态接口<接口描述类型> {
  override 获得JSON接口类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var user = await 参数.kysely
      .selectFrom('user')
      .select(['id', 'name', 'pwd'])
      .where('name', '=', 参数.用户名)
      .executeTakeFirst()
    if (user == null) return new Right({ 用户: null })
    return new Right({ 用户: user })
  }
}
