import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { jwt插件, kysely插件 } from '../../../../global/plugin'
import { 检查JSON参数 } from '../../../../interface-logic/check/check-json-args'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'

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
  .混合(
    new 检查JSON参数(
      z.object({
        page: z.number(),
        size: z.number(),
        orderBy: z.enum(['id', 'name']).optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
        filter: z
          .object({
            id: z.string().optional(),
            name: z.string().optional(),
          })
          .optional(),
      }),
    ),
  )
  .混合(
    接口逻辑.构造([kysely插件], async (参数, 逻辑附加参数, 请求附加参数) => {
      let _log = 请求附加参数.log.extend(接口路径)
      let kysely = 参数.kysely.获得句柄()

      let { page, size, orderBy, orderDirection, filter } = 逻辑附加参数
      if (page <= 0) throw new Error('当前页从1开始')

      let builder总数 = kysely.selectFrom('user').select((eb) => eb.fn.countAll().as('total'))

      let builder数据 = kysely
        .selectFrom('user')
        .select(['id', 'name'])
        .limit(size)
        .offset((page - 1) * size)

      // 应用筛选条件
      if (filter !== void 0) {
        if (filter.id !== void 0) {
          builder数据 = builder数据.where('id', 'like', `%${filter.id}%`)
          builder总数 = builder总数.where('id', 'like', `%${filter.id}%`)
        }
        if (filter.name !== void 0) {
          builder数据 = builder数据.where('name', 'like', `%${filter.name}%`)
          builder总数 = builder总数.where('name', 'like', `%${filter.name}%`)
        }
      }

      // 应用排序
      if (orderBy !== void 0 && orderDirection !== void 0) {
        builder数据 = builder数据.orderBy(orderBy, orderDirection)
      }

      let 查询总数 = await builder总数.executeTakeFirst()
      let 查询数据 = await builder数据.execute()

      if (查询总数 === void 0) throw new Error('查询总数失败')

      return new Right({
        data: 查询数据,
        total: parseInt(查询总数.total as string),
      })
    }),
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
