import {
  常用接口返回器,
  接口,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Left, Right } from '@lsby/ts-fp-data'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../global/plugin'
import { 检查JSON参数 } from '../../../interface-logic/check/check-json-args'

let 接口路径 = '/api/user/login' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .绑定(new 检查JSON参数(z.object({ userName: z.string(), userPassword: z.string() })))
  .绑定(
    接口逻辑.构造([jwt插件.签名器, kysely插件], async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)

      let 用户存在 = await 参数.kysely
        .获得句柄()
        .selectFrom('user')
        .select(['id', 'pwd'])
        .where('name', '=', 逻辑附加参数.userName)
        .executeTakeFirst()
      if (用户存在 === void 0) return new Left('用户不存在或密码错误' as const)

      let 验证密码 = await bcrypt.compare(逻辑附加参数.userPassword, 用户存在.pwd)
      if (验证密码 === false) return new Left('用户不存在或密码错误' as const)

      return new Right({ token: 参数.signJwt({ userId: 用户存在.id }) })
    }),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['验证JSON参数失败', '用户不存在或密码错误'])
let 接口正确类型描述 = z.object({ token: z.string() })

export default new 接口(接口路径, 接口方法, 接口逻辑实现, new 常用接口返回器(接口错误类型描述, 接口正确类型描述))
