import { JSON接口包装基类, 计算实现参数, 计算实现返回 } from '@lsby/net-core'
import API类型定义 from './type'

export class 加法 extends JSON接口包装基类<typeof API类型定义> {
  override 获得API类型(): typeof API类型定义 {
    return API类型定义
  }
  protected override async 业务行为实现(参数: 计算实现参数<typeof API类型定义>): 计算实现返回<typeof API类型定义> {
    return this.构造正确返回({ res: 参数.body.a + 参数.body.b })
  }
}

export default new 加法()
