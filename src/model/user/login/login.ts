import { JSON状态接口, 业务行为, 计算JSON状态接口返回, 计算业务行为参数, 计算接口参数 } from '@lsby/net-core'
import { user } from '../../../types/db'
import { 检查用户密码 } from '../check-user-pwd/check-user-pwd'
import { 查找用户 } from '../find-user/find-user'
import { 接口描述 } from './type'

type 接口描述类型 = typeof 接口描述

export class 登录 extends JSON状态接口<接口描述类型> {
  override 获得API类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var 查找用户行为 = new 查找用户().绑定<计算业务行为参数<查找用户>, '用户不存在', { 用户: user }>((a) =>
      a.用户 ? 业务行为.通过正确值构造({ 用户: a.用户 }) : 业务行为.通过错误值构造('用户不存在'),
    )
    var 验证密码行为 = new 检查用户密码()
    var 最终行为 = 业务行为
      .混合组合多项([查找用户行为, 验证密码行为])
      .映射结果((a) => ({ token: 参数.signJwt({ userId: a.用户.id }) }))
    var 最终结果 = await 最终行为.运行业务行为({ kysely: 参数.kysely, 用户名: 参数.body.name, 输入密码: 参数.body.pwd })
    return 最终结果
  }
}
