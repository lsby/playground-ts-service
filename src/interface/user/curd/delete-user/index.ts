import { 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 检查JSON参数 } from '../../../../interfece-logic/check/check-json-args'
import { 检查登录 } from '../../../../interfece-logic/check/check-login'
import { 删除逻辑 } from '../../../../interfece-logic/components/crud/delete'

let 接口路径 = '/api/user/delete-user' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(
    new 检查登录(
      [
        new Task(async () => (await Global.getItem('jwt-plugin')).解析器),
        new Task(async () => await Global.getItem('kysely-plugin')),
      ],
      () => ({
        表名: 'user',
        id字段: 'id',
      }),
    ),
  )
  .混合(new 检查JSON参数(z.object({ id: z.string() })))
  .混合(
    new 删除逻辑(new Task(async () => await Global.getItem('kysely-plugin')), (data) => ({
      表名: 'user',
      条件们: [['id', '=', data.id]],
    })),
  )

let 接口错误类型描述 = z.enum(['未登录'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
