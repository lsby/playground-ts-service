import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Left, Right } from '@lsby/ts-fp-data'
import { CompiledQuery } from 'kysely'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../global/plugin'
import { 检查管理员登录 } from '../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/sqlite-admin/execute-query' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(new 检查管理员登录([jwt插件.解析器, kysely插件], () => ({ 表名: 'user', id字段: 'id', 标识字段: 'is_admin' })))
  .混合(
    接口逻辑.构造(
      [
        new JSON解析插件(
          z.object({
            sql: z.string(),
            parameters: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
          }),
          {},
        ),
        kysely插件,
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)

        let kysely = 参数.kysely.获得句柄()

        try {
          let 结果 = await kysely.executeQuery(CompiledQuery.raw(参数.sql, 参数.parameters))
          return new Right({
            rows: 结果.rows as any[],
            numAffectedRows: 结果.numAffectedRows === void 0 ? 结果.numAffectedRows : Number(结果.numAffectedRows),
            insertId: 结果.insertId === void 0 ? 结果.insertId : Number(结果.insertId),
          })
        } catch (e) {
          return new Left(String(e))
        }
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.string()
let 接口正确类型描述 = z.object({
  rows: z.array(z.record(z.any())),
  numAffectedRows: z.number().optional(),
  insertId: z.number().optional(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
