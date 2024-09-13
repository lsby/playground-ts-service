import { JSON接口包装基类, 计算JSON实现返回, 计算实现参数 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import API类型定义 from './type'

export class 已登录 extends JSON接口包装基类<typeof API类型定义> {
  override 获得API类型(): typeof API类型定义 {
    return API类型定义
  }
  protected override async 业务行为实现(参数: 计算实现参数<typeof API类型定义>): 计算JSON实现返回<typeof API类型定义> {
    var userId = 参数.userId
    if (userId == null) return new Right({ isLogin: false })
    return new Right({ isLogin: true })
  }
}

export default new 已登录()
