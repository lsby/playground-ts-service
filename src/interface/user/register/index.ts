import { randomUUID } from 'crypto'
import { JSON接口包装基类, 计算JSON实现返回, 计算实现参数 } from '@lsby/net-core'
import { Left, Right } from '@lsby/ts-fp-data'
import { 查找用户 } from '../../../model/action/find-user'
import API类型定义 from './type'

export class 注册 extends JSON接口包装基类<typeof API类型定义> {
  override 获得API类型(): typeof API类型定义 {
    return API类型定义
  }
  protected override async 业务行为实现(参数: 计算实现参数<typeof API类型定义>): 计算JSON实现返回<typeof API类型定义> {
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

export default new 注册()
