import { 服务器 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { onTimeAlarm } from '../cron/on-time-alarm'
import { GlobalCron, GlobalEnv, GlobalLog } from '../global/global'
import { interfaceList } from '../interface/interface-list'

export var app = new Task(async () => {
  var log = (await GlobalLog.getInstance().run()).extend('service')
  var env = await GlobalEnv.getInstance().run()

  await GlobalCron.getInstance().addTask(onTimeAlarm).run()
  await GlobalCron.getInstance().run().run()

  var 服务器地址 = (await new 服务器(interfaceList, env.APP_PORT).run().run()).ip
  await log.debug('服务器地址: %O', 服务器地址).run()
})
