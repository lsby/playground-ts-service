import {
  JSON解析插件,
  WebSocket插件,
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

let 接口路径 = '/api/job-admin/scheduled-job-admin/get-logs' as const
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
          return new JSON解析插件(
            z.object({
              任务id: z.string(),
            }),
            {},
          )
        }),
        new Task(async () => {
          return new WebSocket插件(
            z.object({
              新日志: z.object({
                时间: z.number(),
                消息: z.string(),
              }),
            }),
          )
        }),
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 定时任务管理器 = await Global.getItem('scheduled-job')

        let 任务 = 定时任务管理器.通过id获得任务(参数.任务id)
        if (任务 === null) {
          throw new Error('任务不存在')
        }

        // 监听任务的新日志事件
        任务.设置定时任务日志监听器(async (日志) => {
          await 参数.ws操作?.发送ws信息({ 新日志: { ...日志, 时间: 日志.时间.getTime() } }).catch(() => {})
        })

        await 参数.ws操作?.设置清理函数(async () => {
          任务.设置定时任务日志监听器(null)
        })

        // 返回历史日志列表
        return new Right({ 日志列表: 任务.获得日志列表().map((日志) => ({ ...日志, 时间: 日志.时间.getTime() })) })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({
  日志列表: z.array(
    z.object({
      时间: z.number(),
      消息: z.string(),
    }),
  ),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
