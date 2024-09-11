import { API接口, 包装的正确JSON结果, 计算实现参数, 计算实现结果 } from '@lsby/net-core'
import API类型定义 from './type'

export class 已登录 implements API接口<typeof API类型定义> {
  获得API类型(): typeof API类型定义 {
    return API类型定义
  }

  async API实现(ctx: 计算实现参数<typeof API类型定义>): 计算实现结果<typeof API类型定义> {
    var userId = ctx.userId
    if (userId == null) return new 包装的正确JSON结果({ isLogin: false })
    return new 包装的正确JSON结果({ isLogin: true })
  }
}

export default new 已登录()
