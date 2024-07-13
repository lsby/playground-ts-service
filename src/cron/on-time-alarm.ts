import { Cron } from '@lsby/ts-cron'
import { Global } from '../global/global'

export const onTimeAlarm = new Cron('整点报时', '0 0 * * * *', async () => {
  var log = (await Global.getItem('log')).extend('整点报时')
  await log.debug('我的天啊你看看都%o点了', new Date().getHours())
})
