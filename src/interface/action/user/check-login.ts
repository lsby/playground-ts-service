import { 去除只读, 合并插件结果, 接口逻辑 } from '@lsby/net-core'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'

let 插件 = [
  new Task(async () => {
    let jwt = await Global.getItem('jwt-plugin')
    return jwt.解析器
  }),
  new Task(async () => {
    return await Global.getItem('kysely-plugin')
  }),
] as const
type 插件类型 = 去除只读<typeof 插件>

export type 登录检查器错误类型 = '未登录'
export type 登录检查器正确类型 = { userId: string }

type 附加参数类型 = {}
export class 登录检查器 extends 接口逻辑<插件类型, 附加参数类型, 登录检查器错误类型, 登录检查器正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(
    参数: 合并插件结果<插件类型>,
    _附加参数: 附加参数类型,
  ): Promise<Either<登录检查器错误类型, 登录检查器正确类型>> {
    let userId = 参数.userId ?? null
    if (userId === null) return new Left('未登录')
    let 存在确认 = await 参数.kysely.selectFrom('user').select('id').where('id', '=', userId).executeTakeFirst()
    if (存在确认 === void 0) return new Left('未登录')
    return new Right({ userId: userId })
  }
}
