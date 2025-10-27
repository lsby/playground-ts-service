import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { CompiledQuery } from 'kysely'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 检查管理员登录 } from '../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/sqlite-admin/get-indexes' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(
    new 检查管理员登录(
      [
        new Task(async () => await Global.getItem('jwt-plugin').then((a) => a.解析器)),
        new Task(async () => await Global.getItem('kysely-plugin')),
      ],
      () => ({ 表名: 'user', id字段: 'id', 标识字段: 'is_admin' }),
    ),
  )
  .混合(
    接口逻辑.构造(
      [new Task(async () => await Global.getItem('kysely-plugin'))],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)

        let kysely = 参数.kysely.获得句柄()

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let 结果 = (await kysely.executeQuery(
          CompiledQuery.raw(
            [
              `SELECT name, tbl_name, sql`,
              `FROM sqlite_master`,
              `WHERE type = 'index'`,
              `AND name NOT LIKE 'sqlite_%';`,
            ].join('\n'),
            [],
          ),
        )) as any

        return new Right({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          indexes: 结果.rows.map((row: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            name: row.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            table: row.tbl_name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            sql: row.sql,
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
  indexes: z.array(
    z.object({
      name: z.string(),
      table: z.string(),
      sql: z.string().nullable(),
    }),
  ),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
