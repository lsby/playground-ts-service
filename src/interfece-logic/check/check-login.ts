import { 接口逻辑, 构造元组 } from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { Global } from '../../global/global'

type 逻辑错误类型 = '未登录'
type 逻辑正确类型 = { userId: string }

export function 检查登录<逻辑附加参数类型 extends {}>(
  插件 = 构造元组([
    new Task(async () => (await Global.getItem('jwt-plugin')).解析器),
    new Task(async () => await Global.getItem('kysely-plugin')),
  ]),
): 接口逻辑<typeof 插件, 逻辑附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  return 接口逻辑.构造(插件, async (参数, 逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(检查登录.name)
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
  })
}
