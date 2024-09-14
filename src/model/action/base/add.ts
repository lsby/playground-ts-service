import assert from 'assert'
import { z } from 'zod'
import {
  JSON状态接口,
  JSON状态接口类型,
  JSON解析插件,
  接口测试,
  计算JSON状态接口返回,
  计算接口参数,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 请求用例00 } from '../../../util/request-case-00'

var 接口描述 = new JSON状态接口类型(
  '/api/base/add',
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

export class 加法 extends JSON状态接口<接口描述类型> {
  override 获得API类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    return new Right({ res: 参数.body.a + 参数.body.b })
  }
}

export class 我的测试 extends 接口测试 {
  override async 前置实现(): Promise<void> {}

  override async 中置实现(): Promise<object> {
    return 请求用例00(接口描述, {
      a: 1,
      b: 2,
    })
  }

  override async 后置实现(中置结果: object): Promise<void> {
    var log = await Global.getItem('log')
    var 正确结果 = 接口描述.获得正确结果类型().safeParse(中置结果)
    var 错误结果 = 接口描述.获得错误结果类型().safeParse(中置结果)
    if (!正确结果.success && !错误结果.success) {
      await log.err('没有通过返回值检查: %o, %o', 正确结果.error.errors, 错误结果.error.errors)
      throw new Error('非预期的返回值')
    }
    if (!正确结果.success) throw new Error('应该调用成功, 实际调用出错')
    var 结果 = 正确结果.data
    assert.equal(结果.data.res, 3)
  }
}
