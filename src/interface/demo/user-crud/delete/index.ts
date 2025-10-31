import { 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { z } from 'zod'
import { jwtPlugin, kyselyPlugin } from '../../../../global/global'
import { 检查JSON参数 } from '../../../../interface-logic/check/check-json-args'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'
import { 删除逻辑 } from '../../../../interface-logic/components/crud/delete'

let 接口路径 = '/api/demo/user-crud/delete' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(
    new 检查管理员登录([jwtPlugin.解析器, kyselyPlugin], () => ({
      表名: 'user',
      id字段: 'id',
      标识字段: 'is_admin',
    })),
  )
  .混合(new 检查JSON参数(z.object({ id: z.string() })))
  .混合(
    new 删除逻辑(kyselyPlugin, 'user', async (data) => ({
      条件们: [['id', '=', data.id]],
    })),
  )

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
