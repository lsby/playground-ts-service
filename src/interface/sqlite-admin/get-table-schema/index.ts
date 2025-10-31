import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { CompiledQuery } from 'kysely'
import { z } from 'zod'
import { jwtPlugin, kyselyPlugin } from '../../../global/global'
import { 检查管理员登录 } from '../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/sqlite-admin/get-table-schema' as const
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
  .混合(
    接口逻辑.构造(
      [new JSON解析插件(z.object({ tableName: z.string() }), {}), kyselyPlugin],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)

        let kysely = 参数.kysely.获得句柄()

        let 结果 = await kysely.executeQuery(CompiledQuery.raw(`PRAGMA table_info(${参数.tableName});`, []))

        return new Right({
          columns: 结果.rows.map((row: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            name: row.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            type: row.type,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            notnull: row.notnull,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            pk: row.pk,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            dflt_value: row.dflt_value,
          })),
        })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({
  columns: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      notnull: z.number(),
      pk: z.number(),
      dflt_value: z.string().nullable(),
    }),
  ),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
