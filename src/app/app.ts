import { 服务器 } from '@lsby/net-core'
import { resolve } from 'path'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { Global } from '../global/global'
import { interfaceApiList } from '../interface/interface-list'

export class App {
  public async run(): Promise<void> {
    let log = await Global.getItem('log').then((a) => a.extend('service'))
    let env = await Global.getItem('env').then((a) => a.获得环境变量())

    let cron = await Global.getItem('cron')
    await cron.执行([onTimeAlarm])

    let 静态文件目录 = resolve(import.meta.dirname, '../../web')
    let service = new 服务器(interfaceApiList, env.APP_PORT, 静态文件目录)
    let serviceInfo = await service.run()

    log.debug('已加载的api路径: %O', serviceInfo.api)
    log.debug('静态文件目录: %O', 静态文件目录)
    log.debug('服务器地址: %O', serviceInfo.ip)
  }
}
