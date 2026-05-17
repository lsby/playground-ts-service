import {
  常用接口返回器,
  接口,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Left, Right } from '@lsby/ts-fp-data'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../global/plugin'
import { 检查JSON参数 } from '../../../interface-logic/check/check-json-args'
import { 检查登录 } from '../../../interface-logic/check/check-login-jwt'

let 接口路径 = '/api/user/update-password' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .绑定(new 检查登录([jwt插件.解析器, kysely插件], () => ({ 表名: 'user', id字段: 'id' })))
  .绑定(new 检查JSON参数(z.object({ oldPassword: z.string(), newPassword: z.string() })))
  .绑定(
    接口逻辑.构造([kysely插件], async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)

      let 用户Id = 逻辑附加参数.userId
      let 旧密码 = 逻辑附加参数.oldPassword
      let 新密码 = 逻辑附加参数.newPassword

      if (新密码.includes(' ')) return new Left('新密码不能包含空格' as const)
      if (新密码 === '') return new Left('新密码不能为空' as const)
      if (新密码.length < 6) return new Left('新密码过短' as const)
      if (新密码.length > 32) return new Left('新密码过长' as const)

      let 数据库用户 = await 参数.kysely
        .获得句柄()
        .selectFrom('user')
        .select('pwd')
        .where('id', '=', 用户Id)
        .executeTakeFirst()

      if (数据库用户 === undefined) {
        return new Left('用户不存在' as const)
      }

      let 密码验证结果 = await bcrypt.compare(旧密码, 数据库用户.pwd)
      if (密码验证结果 === false) {
        return new Left('旧密码错误' as const)
      }

      let 新哈希密码 = await bcrypt.hash(新密码, 10)

      await 参数.kysely.获得句柄().updateTable('user').set({ pwd: 新哈希密码 }).where('id', '=', 用户Id).execute()

      return new Right({})
    }),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum([
  '未登录',
  '验证JSON参数失败',
  '用户不存在',
  '旧密码错误',
  '新密码不能包含空格',
  '新密码不能为空',
  '新密码过短',
  '新密码过长',
])
let 接口正确类型描述 = z.object({})

export default new 接口(接口路径, 接口方法, 接口逻辑实现, new 常用接口返回器(接口错误类型描述, 接口正确类型描述))
