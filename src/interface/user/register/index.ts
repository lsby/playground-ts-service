import { randomUUID } from 'crypto'
import { JSON接口包装基类, 计算实现参数, 计算实现返回 } from '@lsby/net-core'
import API类型定义 from './type'

export class 注册 extends JSON接口包装基类<typeof API类型定义> {
  override 获得API类型(): typeof API类型定义 {
    return API类型定义
  }
  protected override async 业务行为实现(参数: 计算实现参数<typeof API类型定义>): 计算实现返回<typeof API类型定义> {
    var 用户存在 = await 参数.kysely
      .selectFrom('user')
      .select('id')
      .where('name', '=', 参数.body.name)
      .executeTakeFirst()
    if (用户存在) return this.构造错误返回('用户名已存在')
    await 参数.kysely
      .insertInto('user')
      .values({ id: randomUUID(), name: 参数.body.name, pwd: 参数.body.pwd })
      .execute()
    return this.构造正确返回({})
  }
}

export default new 注册()
