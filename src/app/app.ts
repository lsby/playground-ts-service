import { 接口, 接口逻辑, 服务器, 路径解析插件, 静态文件返回器 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import path from 'path'
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
          new RegExp('/*'),
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
