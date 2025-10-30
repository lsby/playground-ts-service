import { Global } from '../global/global'
import { 定时任务上下文, 定时任务抽象类 } from '../model/scheduled-job/scheduled-job'

class 定时任务实现 extends 定时任务抽象类 {
  public override 获得名称(): string {
    return '整点报时'
  }
  public override async 获得cron表达式(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`> {
    return '0 0 * * * *'
  }
  public override async 任务逻辑(上下文: 定时任务上下文): Promise<void> {
    let log = await Global.getItem('log').then((a) => a.extend('整点报时'))
    log.debug('我的天啊你看看都%o点了', new Date().getHours())
    上下文.输出日志(`我的天啊你看看都${new Date().getHours()}点了`)
  }
}

export let onTimeAlarm = new 定时任务实现()
