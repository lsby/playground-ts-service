import { 服务器 } from '@lsby/net-core'
import { resolve } from 'path'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { Global } from '../global/global'
import { interfaceApiList } from '../interface/interface-list'

export class App {
  async run(): Promise<void> {
    let log = (await Global.getItem('log')).extend('service')
    let env = await (await Global.getItem('env')).获得环境变量()

    let cron = await Global.getItem('cron')
    await cron.执行([onTimeAlarm])

    let 静态文件目录: string
    if (env.NODE_ENV === 'production') {
      静态文件目录 = resolve(import.meta.dirname, '../../web')
    } else {
      静态文件目录 = resolve(import.meta.dirname, '../../dist/web')
    }
    let service = new 服务器(interfaceApiList, env.APP_PORT, 静态文件目录)
    let serviceInfo = await service.run()

    await log.debug('已加载的api路径: %O', serviceInfo.api)
    await log.debug('静态文件目录: %O', 静态文件目录)
    await log.debug('服务器地址: %O', serviceInfo.ip)
  }
}
