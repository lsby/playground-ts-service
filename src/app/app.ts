import { 服务器 } from '@lsby/net-core'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { Global } from '../global/global.js'
import { interfaceList } from '../interface/interface-list'

export class App {
  async run(): Promise<void> {
    let log = (await Global.getItem('log')).extend('service')
    let env = await (await Global.getItem('env')).获得环境变量()

    let cron = await Global.getItem('cron')
    await cron.执行([onTimeAlarm])

    let service = new 服务器(interfaceList, env.APP_PORT, env.WEB_PATH)
    let serviceInfo = await service.run()
    await log.debug('服务器地址: %O', serviceInfo.ip)
  }
}
