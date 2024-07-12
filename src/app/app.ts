import { 服务器 } from '@lsby/net-core'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { GlobalCron, GlobalEnv, GlobalLog } from '../global/global'
import { interfaceList } from '../interface/interface-list'

export var app = new Promise(async () => {
  var log = (await GlobalLog.getInstance()).extend('service')
  var env = await GlobalEnv.getInstance()

  await GlobalCron.getInstance().addTask(onTimeAlarm)
  await GlobalCron.getInstance().run()

  var 服务器地址 = (await new 服务器(interfaceList, env.APP_PORT).run()).ip
  await log.debug('服务器地址: %O', 服务器地址)
})
