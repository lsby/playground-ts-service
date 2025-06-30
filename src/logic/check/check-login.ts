import { 合并插件结果, 接口逻辑, 请求附加参数类型 } from '@lsby/net-core'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../global/global'
import { 构造元组 } from '../../types'

let 逻辑插件 = 构造元组([
  new Task(async () => (await Global.getItem('jwt-plugin')).解析器),
  new Task(async () => await Global.getItem('kysely-plugin')),
])

type 逻辑插件类型 = typeof 逻辑插件
type 逻辑参数类型 = 合并插件结果<逻辑插件类型>
type 逻辑附加参数类型 = {}

type 逻辑错误类型 = '未登录'
type 逻辑正确类型 = { userId: string }

class 逻辑实现 extends 接口逻辑<逻辑插件类型, 逻辑附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 逻辑插件类型 {
    return [...逻辑插件]
  }

  override async 实现(
    参数: 逻辑参数类型,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let _log = 请求附加参数.log.extend('登录检查器')
    let userId = 参数.userId ?? null
    if (userId === null) return new Left('未登录')
    let 存在确认 = await 参数.kysely
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst()
    if (存在确认 === void 0) return new Left('未登录')
    return new Right({ userId: userId })
  }
}

export let 登录检查器 = 逻辑实现
