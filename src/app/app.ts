import { 服务器 } from '@lsby/net-core'
import { resolve } from 'path'
import { Global } from '../global/global'
import { interfaceApiList } from '../interface/interface-list'
import { 报告系统情况任务 } from '../job/instant-job/report-system-status'
import { databaseBackupCron } from '../job/scheduled-job/database-backup'
import { onTimeAlarm } from '../job/scheduled-job/on-time-alarm'

export class App {
  public async run(): Promise<void> {
    let log = await Global.getItem('log').then((a) => a.extend('service'))
    let env = await Global.getItem('env').then((a) => a.获得环境变量())

    let cron = await Global.getItem('scheduled-job')
    await cron.执行([onTimeAlarm, databaseBackupCron])

    let 静态文件目录 = resolve(import.meta.dirname, '../../web')
    let service = new 服务器(interfaceApiList, env.APP_PORT, 静态文件目录)
    let serviceInfo = await service.run()

    await log.debug('已加载的api路径: %O', serviceInfo.api)
    await log.debug('静态文件目录: %O', 静态文件目录)
    await log.debug('服务器地址: %O', serviceInfo.ip)

    let 即时任务管理器 = await Global.getItem('instant-job')
    即时任务管理器.提交任务(报告系统情况任务)
  }
}
