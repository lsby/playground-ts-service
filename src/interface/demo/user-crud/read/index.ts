import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../../global/plugin'
import { 检查JSON参数 } from '../../../../interface-logic/check/check-json-args'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'
import { 查询逻辑 } from '../../../../interface-logic/components/crud/read'

let 接口路径 = '/api/demo/user-crud/read' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(
    new 检查管理员登录([jwt插件.解析器, kysely插件], () => ({
      表名: 'user',
      id字段: 'id',
      标识字段: 'is_admin',
    })),
  )
  .混合(new 检查JSON参数(z.object({ page: z.number(), size: z.number() })))
  .混合(
    new 查询逻辑(
      kysely插件,
      'user',
      async (data) => ({
        选择的字段们: ['id', 'name'],
        当前页: data.page,
        每页数量: data.size,
        排序字段: 'created_at',
        排序模式: 'asc',
      }),
      async (a) => a,
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({
  data: z.object({ id: z.string(), name: z.string() }).array(),
  total: z.number(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
