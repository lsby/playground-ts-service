import { JSON接口包装基类, 业务行为, 计算JSON实现返回, 计算业务行为参数, 计算实现参数 } from '@lsby/net-core'
import { 检查用户密码 } from '../../../model/action/check-user-pwd'
import { 查找用户 } from '../../../model/action/find-user'
import { user } from '../../../types/db'
import API类型定义 from './type'

export class 登录 extends JSON接口包装基类<typeof API类型定义> {
  override 获得API类型(): typeof API类型定义 {
    return API类型定义
  }
  protected override async 业务行为实现(参数: 计算实现参数<typeof API类型定义>): 计算JSON实现返回<typeof API类型定义> {
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

export default new 登录()
