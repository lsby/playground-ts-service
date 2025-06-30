import { 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 登录检查器 } from '../../../../logic/check/check-login'
import { 表查询组件 } from '../../../../logic/components/curd/read'

let 接口路径 = '/api/demo/curd/read' as const
let 接口方法 = 'post' as const

let 逻辑错误类型Zod = z.enum(['未登录'])
let 逻辑正确类型Zod = z.object({
  list: z.object({ name: z.string() }).array(),
})

let 接口实现 = 接口逻辑.混合([
  new 登录检查器(),
  new 表查询组件([new Task(async () => await Global.getItem('kysely-plugin'))], {
    表名称: 'user',
    查询列: ['user.name'],
  }),
])

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 逻辑错误类型Zod, 逻辑正确类型Zod)
