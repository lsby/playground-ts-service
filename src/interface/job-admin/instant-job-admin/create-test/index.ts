import {
  JSON解析插件,
  常用形式接口封装,
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
import { 即时任务抽象类 } from '../../../../model/instant-job/instant-job'

let 接口路径 = '/api/job-admin/instant-job-admin/create-test' as const
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
    接口逻辑.构造(
      [
        new JSON解析插件(
          z.object({
            测试任务名称: z.string(),
            任务优先级: z.number().optional(),
            最大重试次数: z.number().optional(),
            测试任务消息: z.string(),
            测试任务持续时间: z.number(),
          }),
          {},
        ),
      ],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log.extend(接口路径)
        let 任务管理器 = 即时任务管理器

        let 任务 = 即时任务抽象类.创建任务<string>({
          任务名称: 参数.测试任务名称,
          ...(参数.任务优先级 !== void 0 ? { 即时任务优先级: 参数.任务优先级 } : {}),
          ...(参数.最大重试次数 !== void 0 ? { 最大重试次数: 参数.最大重试次数 } : {}),
          任务逻辑: async (上下文) => {
            // 测试任务逻辑：每秒打印消息，持续指定时间
            let 消息内容 = 参数.测试任务消息
            let 持续时间秒 = 参数.测试任务持续时间
            let 开始时间 = Date.now()
            let 打印次数 = 0

            上下文.输出日志(`开始测试任务: ${参数.测试任务名称}`)
            上下文.输出日志(`消息内容: ${消息内容}`)
            上下文.输出日志(`持续时间: ${持续时间秒}秒`)

            let 当前时间戳 = Date.now()
            let 结束时间戳 = 开始时间 + 持续时间秒 * 1000

            while (当前时间戳 < 结束时间戳) {
              let 当前时间 = new Date().toLocaleTimeString()
              上下文.输出日志(`[${当前时间}] ${消息内容} (第${打印次数 + 1}次)`)
              打印次数 = 打印次数 + 1

              await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 1000)
              })

              当前时间戳 = Date.now()
            }

            上下文.输出日志(`测试任务完成，共打印${打印次数}次消息`)
            return `测试任务完成: 共打印${打印次数}次消息`
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
