import { randomUUID } from 'crypto'
import { z } from 'zod'
import { JSON状态接口, JSON状态接口类型, JSON解析插件, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 查找用户 } from './find-user'

var 接口描述 = new JSON状态接口类型(
  '/api/user/register',
  'post',
  [
    new Task(async () => {
      return await Global.getItem('kysely-plugin')
    }),
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          name: z.string(),
          pwd: z.string(),
        }),
        {},
      )
    }),
  ],
  z.object({}),
  z.enum(['用户名已存在']),
)
type 接口描述类型 = typeof 接口描述

export class 注册 extends JSON状态接口<接口描述类型> {
  override 获得API类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var 用户存在 = (await new 查找用户().运行业务行为({ kysely: 参数.kysely, 用户名: 参数.body.name }))
      .assertRight()
      .getRight()
    if (用户存在.用户) return new Left('用户名已存在')
    await 参数.kysely
      .insertInto('user')
      .values({ id: randomUUID(), name: 参数.body.name, pwd: 参数.body.pwd })
      .execute()
    return new Right({})
  }
}
