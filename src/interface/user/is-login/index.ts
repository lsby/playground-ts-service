import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'

let 接口路径 = '/api/user/is-login' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑.空逻辑().混合(
  接口逻辑.构造(
    [
      new Task(async () => {
        let jwt = await Global.getItem('jwt-plugin')
        return jwt.解析器
      }),
      new Task(async () => await Global.getItem('kysely-plugin')),
    ],
    async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)

      let userId = 参数.userId
      if (userId === void 0) return new Right({ isLogin: false })

      let 用户存在确认 = await 参数.kysely
        .获得句柄()
        .selectFrom('user')
        .select('id')
        .where('user.id', '=', userId)
        .executeTakeFirst()

      if (用户存在确认 === void 0) return new Right({ isLogin: false })
      return new Right({ isLogin: true })
    },
  ),
)

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({
  isLogin: z.boolean(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
