import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 检查JSON参数 } from '../../../../interfece-logic/check/check-json-args'
import { 检查登录 } from '../../../../interfece-logic/check/check-login'
import { 查询逻辑 } from '../../../../interfece-logic/components/crud/read'

let 接口路径 = '/api/user/select-user-list' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(检查登录())
  .混合(检查JSON参数(z.object({ page: z.number(), size: z.number() })))
  .混合(
    new 查询逻辑(new Task(async () => await Global.getItem('kysely-plugin')), (data) => ({
      表名: 'user',
      选择的字段们: ['id', 'name'],
      当前页: data.page,
      每页数量: data.size,
      排序字段: 'id',
      排序模式: 'asc',
    })),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录'])
let 接口正确类型描述 = z.object({
  list: z.object({ id: z.string(), name: z.string() }).array(),
  count: z.number(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
