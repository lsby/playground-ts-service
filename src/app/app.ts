import { 服务器 } from '@lsby/net-core'
import { resolve } from 'path'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { Global } from '../global/global'
import { interfaceList } from '../interface-api/interface-api-list'
import { interfaceTableList } from '../interface-table/interface-table-list'

export class App {
  async run(): Promise<void> {
    let log = (await Global.getItem('log')).extend('service')
    let env = await (await Global.getItem('env')).获得环境变量()

    let cron = await Global.getItem('cron')
    await cron.执行([onTimeAlarm])

    let service = new 服务器(interfaceList, interfaceTableList, env.APP_PORT, resolve(import.meta.dirname, '../../web'))
    let serviceInfo = await service.run()
    await log.debug('服务器地址: %O', serviceInfo.ip)
  }
}
