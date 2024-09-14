import { z } from 'zod'
import { JSON状态接口, JSON状态接口类型, JSON解析插件, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'

var 接口描述 = new JSON状态接口类型(
  '/api/user/is-login',
  'post',
  [
    new Task(async () => {
      var jwt = await Global.getItem('jwt-plugin')
      return jwt.解析器
    }),
    new Task(async () => {
      return new JSON解析插件(z.object({}), {})
    }),
  ],
  z.object({
    isLogin: z.boolean(),
  }),
  z.never(),
)
type 接口描述类型 = typeof 接口描述

export class 已登录 extends JSON状态接口<接口描述类型> {
  override 获得API类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var userId = 参数.userId
    if (userId == null) return new Right({ isLogin: false })
    return new Right({ isLogin: true })
  }
}
