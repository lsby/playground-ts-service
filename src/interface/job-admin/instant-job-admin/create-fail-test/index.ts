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
import { 即时任务抽象类 } from '../../../../model/instant-job/instant-job'

let 接口路径 = '/api/job-admin/instant-job-admin/create-fail-test' as const
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
              失败任务名称: z.string(),
              任务优先级: z.number().optional(),
              最大重试次数: z.number(),
              失败消息: z.string(),
              失败延迟时间: z.number().optional(), // 延迟多少毫秒后失败
            }),
            {},
          )
        }),
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 任务管理器 = await Global.getItem('instant-job')

        let 任务 = 即时任务抽象类.创建任务<string>({
          任务名称: 参数.失败任务名称,
          ...(参数.任务优先级 !== void 0 ? { 即时任务优先级: 参数.任务优先级 } : {}),
          最大重试次数: 参数.最大重试次数,
          任务逻辑: async (上下文) => {
            上下文.输出日志(`开始失败测试任务: ${参数.失败任务名称}`)
            上下文.输出日志(`失败消息: ${参数.失败消息}`)
            上下文.输出日志(`最大重试次数: ${参数.最大重试次数}`)

            // 如果设置了延迟时间，先等待
            if (参数.失败延迟时间 !== void 0 && 参数.失败延迟时间 > 0) {
              上下文.输出日志(`等待 ${参数.失败延迟时间} 毫秒后失败`)
              await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 参数.失败延迟时间)
              })
            }

            // 必然失败，抛出错误
            上下文.输出日志(`任务执行失败: ${参数.失败消息}`)
            throw new Error(参数.失败消息)
          },
        })

        let 任务id = 任务管理器.提交任务(任务)

        return new Right({ 任务id })
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({
  任务id: z.string(),
})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
