import { z } from 'zod'
import { JSON状态接口, JSON状态接口类型, JSON解析插件, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'

var 接口描述 = new JSON状态接口类型(
  '/api/base/sub',
  'post',
  [
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          a: z.number(),
          b: z.number(),
        }),
        {},
      )
    }),
  ],
  z.object({
    res: z.number(),
  }),
  z.never(),
)
type 接口描述类型 = typeof 接口描述

export class 减法 extends JSON状态接口<接口描述类型> {
  override 获得API类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    return new Right({ res: 参数.body.a - 参数.body.b })
  }
}
