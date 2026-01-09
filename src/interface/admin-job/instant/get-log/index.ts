import {
  JSON参数解析插件,
  WebSocket插件,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 即时任务管理器 } from '../../../../global/global'
import { jwt插件, kysely插件 } from '../../../../global/plugin'
import { 检查管理员登录 } from '../../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/admin-job/instant/get-log' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .绑定(new 检查管理员登录([jwt插件.解析器, kysely插件], () => ({ 表名: 'user', id字段: 'id', 标识字段: 'is_admin' })))
  .绑定(
    接口逻辑.构造(
      [
        new JSON参数解析插件(z.object({ 任务id: z.string() }), {}),
        new WebSocket插件(z.object({ 新日志: z.object({ 时间: z.number(), 消息: z.string() }) }), z.object({})),
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 任务管理器 = 即时任务管理器

        let 任务 = 任务管理器.获得所有任务列表().find((t) => t.获得id() === 参数.body.任务id)
        if (任务 === void 0) {
          throw new Error('任务不存在')
        }

        let 监听器 = async (日志: { 时间: Date; 消息: string }): Promise<void> => {
          await 参数.ws操作?.发送ws信息({ 新日志: { ...日志, 时间: 日志.时间.getTime() } }).catch(() => {})
        }
        let 持有者 = 任务.添加即时任务日志监听器(监听器)

        await 参数.ws操作?.设置清理函数(async () => {
          任务.移除即时任务日志监听器(持有者)
        })

        return new Right({ 日志列表: 任务.获得日志列表().map((日志) => ({ ...日志, 时间: 日志.时间.getTime() })) })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({ 日志列表: z.array(z.object({ 时间: z.number(), 消息: z.string() })) })

import { 常用接口返回器, 接口 } from '@lsby/net-core'
export default new 接口(接口路径, 接口方法, 接口逻辑实现, new 常用接口返回器(接口错误类型描述, 接口正确类型描述))
