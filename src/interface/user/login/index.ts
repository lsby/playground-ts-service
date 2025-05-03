import {
  去除只读,
  合并插件结果,
  常用形式转换器,
  接口,
  接口逻辑,
  获得接口逻辑正确类型,
  获得接口逻辑错误类型,
} from '@lsby/net-core'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { createHash } from 'crypto'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 检查用户名, 检查用户名正确类型 } from '../../action/check-user-name'
import { 检查密码, 检查密码正确类型 } from '../../action/check-user-pwd'

let 接口路径 = '/api/user/login' as const
let 接口方法 = 'post' as const

let 插件 = [
  new Task(async () => {
    let jwt = await Global.getItem('jwt-plugin')
    return jwt.签名器
  }),
  new Task(async () => await Global.getItem('kysely-plugin')),
] as const

let 逻辑错误类型Zod = z.enum([
  '用户不存在或密码错误',
  '用户名不能包含空格',
  '用户名不能为空',
  '用户名过短',
  '用户名过长',
  '密码不能包含空格',
  '密码不能为空',
  '密码过短',
  '密码过长',
])
let 逻辑正确类型Zod = z.object({
  token: z.string(),
})

type 附加参数类型 = 检查用户名正确类型 & 检查密码正确类型
class 逻辑实现 extends 接口逻辑<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(参数: 参数类型, 附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let _log = (await Global.getItem('log')).extend(接口路径)

    let 用户存在 = await 参数.kysely
      .selectFrom('user')
      .select('id')
      .where('name', '=', 附加参数.userName)
      .where('pwd', '=', createHash('md5').update(附加参数.userPassword).digest('hex'))
      .executeTakeFirst()

    if (用户存在 === void 0) return new Left('用户不存在或密码错误')
    return new Right({ token: 参数.signJwt({ userId: 用户存在.id }) })
  }
}
let 接口实现 = 接口逻辑.混合([new 检查用户名(), new 检查密码(), new 逻辑实现()])

type 插件类型 = 去除只读<typeof 插件>
type 参数类型 = 合并插件结果<插件类型>
type 逻辑错误类型 = z.infer<typeof 逻辑错误类型Zod>
type 逻辑正确类型 = z.infer<typeof 逻辑正确类型Zod>
let 接口错误输出形式 = z.object({ status: z.literal('fail'), data: 逻辑错误类型Zod })
let 接口正确输出形式 = z.object({ status: z.literal('success'), data: 逻辑正确类型Zod })
let 接口转换器 = new 常用形式转换器<获得接口逻辑错误类型<typeof 接口实现>, 获得接口逻辑正确类型<typeof 接口实现>>()
export default new 接口(接口路径, 接口方法, 接口实现, 接口错误输出形式, 接口正确输出形式, 接口转换器)
