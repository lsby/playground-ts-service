import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { createHash } from 'crypto'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 检查JSON参数 } from '../../../../interfece-logic/check/check-json-args'
import { 检查登录 } from '../../../../interfece-logic/check/check-login'
import { 新增逻辑 } from '../../../../interfece-logic/components/crud/create'

let 接口路径 = '/api/user/add-user' as const
let 接口方法 = 'post' as const

let 用户表 = z.object({
  id: z.string(),
  name: z.string(),
  pwd: z.string(),
})
let kysely插件 = new Task(async () => await Global.getItem('kysely-plugin'))

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(检查登录())
  .混合(检查JSON参数(z.object({ name: z.string(), pwd: z.string() })))
  .混合(
    新增逻辑({
      表名: 'user',
      表结构zod: 用户表,
      生成新增数据: (data) => ({
        id: crypto.randomUUID(),
        name: data.name,
        pwd: createHash('md5').update(data.pwd).digest('hex'),
      }),
      kysely插件: kysely插件,
    }),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
