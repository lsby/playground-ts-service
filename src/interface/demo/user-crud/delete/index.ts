import { 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { Kysely管理器 } from '@lsby/ts-kysely'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../../global/plugin'
import { 检查JSON参数 } from '../../../../interface-logic/check/check-json-args'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'
import { 删除逻辑 } from '../../../../interface-logic/components/crud/delete'

let 接口路径 = '/api/demo/user-crud/delete' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(new 检查管理员登录([jwt插件.解析器, kysely插件], () => ({ 表名: 'user', id字段: 'id', 标识字段: 'is_admin' })))
  .混合(new 检查JSON参数(z.object({ id: z.string() })))
  .混合(
    接口逻辑.构造([kysely插件], async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(删除逻辑.name)

      return 参数.kysely.执行事务Either(async (trx) => {
        return 接口逻辑
          .空逻辑()
          .混合(
            new 删除逻辑(kysely插件, 'user_config', async () => ({
              条件们: [['user_id', '=', 逻辑附加参数.id]],
            })),
          )
          .混合(
            new 删除逻辑(kysely插件, 'user', async () => ({
              条件们: [['id', '=', 逻辑附加参数.id]],
            })),
          )
          .实现({ kysely: Kysely管理器.从句柄创建(trx) }, {}, 请求附加参数)
      })
    }),
  )

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
