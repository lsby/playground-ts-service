import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../global/global'
import { Cron } from '../tools/common/cron'

export const onTimeAlarm = new Cron(
  '整点报时',
  '0 0 * * * *',
  new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('整点报时')
    await log.debug('我的天啊你看看都%o点了', new Date().getHours()).run()
  }),
)
