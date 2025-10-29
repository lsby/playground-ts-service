import { Global } from '../global/global'
import { Cron抽象类 } from '../model/cron/cron'

class 定时任务实现 extends Cron抽象类 {
  public override getName(): string {
    return '整点报时'
  }
  public override async getCron(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`> {
    return '0 0 * * * *'
  }
  public override async run(): Promise<void> {
    let log = await Global.getItem('log').then((a) => a.extend('整点报时'))
    log.debug('我的天啊你看看都%o点了', new Date().getHours())
  }
}

export let onTimeAlarm = new 定时任务实现()
