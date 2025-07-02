import {
  常用形式接口封装,
  接口逻辑,
  构造元组,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { createHash } from 'crypto'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 检查用户名 } from '../../../interfece-logic/check/check-user-name'
import { 检查密码 } from '../../../interfece-logic/check/check-user-pwd'

let 接口路径 = '/api/user/login' as const
let 接口方法 = 'post' as const

let 接口实现 = 接口逻辑
  .空逻辑()
  .混合(检查用户名('userName'))
  .混合(检查密码('userPassword'))
  .混合(
    接口逻辑.构造(
      构造元组([
        new Task(async () => {
          let jwt = await Global.getItem('jwt-plugin')
          return jwt.签名器
        }),
        new Task(async () => await Global.getItem('kysely-plugin')),
      ]),
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 用户存在 = await 参数.kysely
          .获得句柄()
          .selectFrom('user')
          .select('id')
          .where('name', '=', 逻辑附加参数.userName)
          .where('pwd', '=', createHash('md5').update(逻辑附加参数.userPassword).digest('hex'))
          .executeTakeFirst()

        if (用户存在 === void 0) return new Left('用户不存在或密码错误')
        return new Right({ token: 参数.signJwt({ userId: 用户存在.id }) })
      },
    ),
  )

type _接口JSON参数 = 计算接口逻辑JSON参数<typeof 接口实现>
type _接口错误返回 = 计算接口逻辑错误结果<typeof 接口实现>
type _接口正确返回 = 计算接口逻辑正确结果<typeof 接口实现>

let 接口错误类型描述 = z.enum([
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
let 接口正确类型描述 = z.object({
  token: z.string(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 接口错误类型描述, 接口正确类型描述)
