import { 服务器 } from '@lsby/net-core'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { Global, GlobalCron } from '../global/global'
import { interfaceList } from '../interface/interface-list'

export var app = new Promise(async () => {
  var log = (await Global.getItem('log')).extend('service')
  var env = await (await Global.getItem('env')).获得环境变量()

  await GlobalCron.getInstance().addTask(onTimeAlarm)
  await GlobalCron.getInstance().run()

  var 服务器地址 = (await new 服务器(interfaceList, env.APP_PORT).run()).ip
  await log.debug('服务器地址: %O', 服务器地址)
})
