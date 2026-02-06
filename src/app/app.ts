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
          new RegExp('/__parcel_source_root/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 相对路径 = 参数.path.rawPath.replace(/^\/__parcel_source_root\//, '')
            let 文件路径 = path.join(import.meta.dirname, '../../', 相对路径)
            return new Right({ filePath: 文件路径 })
          }),
          new 静态文件返回器({}),
        ),
        new 接口(
          new RegExp('/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 路径 = 参数.path.rawPath === '/' ? '/index.html' : 参数.path.rawPath
            let web根路径
            switch (环境变量.RUN_MODE) {
              case 'tsx':
                web根路径 = path.join(import.meta.dirname, '../../dist/src/web', 路径)
                break
              case 'dist':
                web根路径 = path.join(import.meta.dirname, '../web', 路径)
                break
            }
            return new Right({ filePath: web根路径 })
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
