import {
  JSON解析插件,
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/job-admin/scheduled-job-admin/list' as const
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
      [
        new Task(async () => {
          return new JSON解析插件(z.object({}), {})
        }),
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 定时任务管理器 = await Global.getItem('scheduled-job')

        let 任务列表 = 定时任务管理器.获取任务列表().map((任务) => ({
          ...任务,
          下次执行时间: 任务.下次执行时间?.getTime() ?? null,
          最后执行时间: 任务.最后执行时间?.getTime() ?? null,
        }))

        return new Right({ 任务列表 })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({
  任务列表: z.array(
    z.object({
      id: z.string(),
      名称: z.string(),
      表达式: z.string(),
      状态: z.string(),
      下次执行时间: z.number().nullable(),
      最后执行时间: z.number().nullable(),
      执行次数: z.number(),
    }),
  ),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
