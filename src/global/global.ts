import { Kysely管理器 } from '@lsby/ts-kysely'
import { Log } from '@lsby/ts-log'
import { 即时任务管理器类 } from '../model/job-instant/instant-job-manager'
import { 定时任务管理器类 } from '../model/job-scheduled/scheduled-job-manager'
import { 日志模型 } from '../model/log/log-model'
import { DB } from '../types/db'
import { 创建sqlite数据库适配器 } from './db/db-dialect'
import { 环境变量 } from './env'

export let 即时任务管理器 = new 即时任务管理器类({ 最大并发数: 10, 历史记录保留天数: 7 })
export let 定时任务管理器 = new 定时任务管理器类()
export let 日志模型实例 = new 日志模型()
export let syncLogCallBack = async (level: string, namespace: string, content: string): Promise<void> => {
  if (content.includes('WebSocket 未打开，无法发送消息')) return // 避免无限循环
  await 日志模型实例.记录日志(`[${level}] [${namespace}] ${content}`)
}
export let globalLog = new Log(环境变量.DEBUG_NAME).pipe(syncLogCallBack)
export let kysely管理器 = await (async function (): Promise<Kysely管理器<DB>> {
  return Kysely管理器.从适配器创建<DB>(
    await 创建sqlite数据库适配器(环境变量.DB_PATH),
    环境变量.NODE_ENV === 'production' ? [] : ['query', 'error'],
  )
  // return Kysely管理器.从适配器创建<DB>(
  //   await 创建pg数据库适配器({
  //     host: 环境变量.DB_HOST,
  //     port: 环境变量.DB_PORT,
  //     user: 环境变量.DB_USER,
  //     password: 环境变量.DB_PWD,
  //     database: 环境变量.DB_NAME,
  //   }),
  //   环境变量.NODE_ENV === 'production' ? [] : ['query', 'error'],
  // )
  // return Kysely管理器.从适配器创建<DB>(
  //   await 创建mysql数据库适配器({
  //     host: 环境变量.DB_HOST,
  //     port: 环境变量.DB_PORT,
  //     user: 环境变量.DB_USER,
  //     password: 环境变量.DB_PWD,
  //     database: 环境变量.DB_NAME,
  //   }),
  //   环境变量.NODE_ENV === 'production' ? [] : ['query', 'error'],
  // )
})()
