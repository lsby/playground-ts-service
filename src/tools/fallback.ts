import { 环境变量 } from 'src/global/env'
import { globalLog } from '../global/global'

/**
 * 启动异常兜底，防止未捕获的异常导致进程崩溃
 */
export function 启动异常兜底(): void {
  if (环境变量.NODE_ENV !== 'production') return
  process.on('uncaughtException', (error) => {
    void globalLog.error('未捕获的异常 (uncaughtException): %O', error)
  })
  process.on('unhandledRejection', (reason, promise) => {
    void globalLog.error('未处理的 Promise 拒绝 (unhandledRejection): %O, Promise: %O', reason, promise)
  })
}
