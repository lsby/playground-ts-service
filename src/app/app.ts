import { 接口, 接口逻辑, 服务器, 自定义接口返回器, 路径解析插件, 静态文件返回器 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import path from 'path'
import { z } from 'zod'
import { 环境变量 } from '../global/env'
import { globalLog, syncLogCallBack, 即时任务管理器, 定时任务管理器 } from '../global/global'
import { interfaceApiList } from '../interface/interface-list'
import { 报告系统情况任务 } from '../job/instant-job/report-system-status'
import { databaseBackupCron } from '../job/scheduled-job/database-backup'
import { onTimeAlarm } from '../job/scheduled-job/on-time-alarm'

export class App {
  private 获得项目根路径(): string {
    switch (环境变量.APP_ENV) {
      case 'development-web':
      case 'test-web':
        return path.resolve(import.meta.dirname, '../../')
      case 'production-web':
      case 'production-electron':
        return path.resolve(import.meta.dirname, '../../../')
      case 'production-sea':
        return path.resolve(import.meta.dirname, './')
    }
  }

  public async run(): Promise<void> {
    let log = globalLog.extend('service')
    await 定时任务管理器.执行([onTimeAlarm, databaseBackupCron])

    let 服务 = new 服务器({
      接口们: [
        ...interfaceApiList,
        new 接口(
          '/favicon.ico',
          'get',
          接口逻辑.构造([], async () => new Right({})),
          new 自定义接口返回器(z.never(), z.object({}), z.string(), z.object({}), (req, res, _data) => {
            res.statusCode = 404
            return res.end()
          }),
        ),
        new 接口(
          new RegExp('/public/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 项目根路径 = this.获得项目根路径()
            let 基准目录 = path.resolve(项目根路径, 'public')
            let 相对路径 = 参数.path.rawPath.replace(/^\/public\//, '')

            let 文件路径 = path.join(基准目录, 相对路径)

            // 路径遍历检查
            let 规范化文件路径 = path.resolve(文件路径)
            let 规范化基准目录 = path.resolve(基准目录)
            let 相对路径检查 = path.relative(规范化基准目录, 规范化文件路径)
            if (相对路径检查.startsWith('..') || path.isAbsolute(相对路径检查)) {
              return new Right({ filePath: '' })
            }

            return new Right({ filePath: 文件路径 })
          }),
          new 静态文件返回器({}),
        ),
        new 接口(
          new RegExp('/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 路径 = 参数.path.rawPath === '/' ? '/index.html' : 参数.path.rawPath
            let 项目根路径 = this.获得项目根路径()
            let web根目录 = path.join(项目根路径, 'dist/src/web')

            let 基准目录 = path.resolve(web根目录)
            let 文件路径 = path.join(基准目录, 路径)

            // 路径遍历检查
            let 规范化文件路径 = path.resolve(文件路径)
            let 规范化基准目录 = path.resolve(基准目录)
            let 相对路径检查 = path.relative(规范化基准目录, 规范化文件路径)
            if (相对路径检查.startsWith('..') || path.isAbsolute(相对路径检查)) {
              return new Right({ filePath: '' })
            }

            return new Right({ filePath: 文件路径 })
          }),
          new 静态文件返回器({}),
        ),
      ],
      端口: 环境变量.APP_PORT,
      日志回调: syncLogCallBack,
    })
    let 服务信息 = await 服务.run()

    await log.debug('已加载的api路径: %O', 服务信息.api)
    await log.debug('服务器地址: %O', 服务信息.ip)

    即时任务管理器.提交任务(报告系统情况任务)
  }
}
