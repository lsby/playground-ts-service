import { CompiledQuery } from 'kysely'
import { env, globalLog, instantJob, kysely } from '../../global/global'
import { 即时任务抽象类 } from '../../model/instant-job/instant-job'

export let 报告系统情况任务 = 即时任务抽象类.创建任务({
  任务名称: '报告系统情况',
  即时任务优先级: 1,
  最大重试次数: 0,
  任务逻辑: async (上下文) => {
    上下文.输出日志('开始报告系统情况...')

    // 报告环境信息
    上下文.输出日志(`环境: ${env.NODE_ENV}`)
    上下文.输出日志(`调试名称: ${env.DEBUG_NAME}`)
    上下文.输出日志(`数据库类型: ${env.DB_TYPE}`)
    上下文.输出日志(`应用端口: ${env.APP_PORT}`)
    上下文.输出日志(`Web端口: ${env.WEB_PORT}`)

    // 报告数据库状态
    try {
      await kysely.获得句柄().executeQuery(CompiledQuery.raw('SELECT 1 as test', []))
      上下文.输出日志('数据库连接正常')
    } catch (错误) {
      上下文.输出日志(`数据库检查失败: ${String(错误)}`)
    }

    // 报告任务管理器状态
    let 即时任务管理器 = instantJob
    上下文.输出日志(`即时任务管理器最大并发数: ${即时任务管理器.获得最大并发数()}`)

    // 报告系统时间
    上下文.输出日志(`系统启动时间: ${new Date().toISOString()}`)

    上下文.输出日志('系统情况报告完成')

    return { 状态: '成功' }
  },
  执行失败钩子: async (错误) => {
    let log = globalLog.extend('系统报告')
    await log.error('系统情况报告任务执行失败', 错误)
  },
})
