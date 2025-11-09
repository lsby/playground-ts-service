import schedule from 'node-schedule'
import { 定时任务抽象类 } from './scheduled-job'

export type 定时任务状态 = '未启动' | '运行中' | '已停止'
export type 定时任务信息 = {
  id: string
  名称: string
  表达式: string
  状态: 定时任务状态
  下次执行时间: Date | null
  最后执行时间: Date | null
  执行次数: number
}

export class 定时任务管理器类 {
  private 运行中 = false
  private 调度任务列表: Array<{ 任务: 定时任务抽象类; job: schedule.Job; 信息: 定时任务信息 }> = []

  public constructor() {}

  private async 执行任务(任务: 定时任务抽象类, 任务信息: 定时任务信息, job: schedule.Job): Promise<void> {
    if (任务信息.状态 === '运行中') {
      任务.记录日志('任务已在执行中，跳过本次执行')
      return
    }

    let 开始时间 = new Date()
    任务信息.状态 = '运行中'
    任务信息.最后执行时间 = 开始时间
    任务信息.下次执行时间 = job.nextInvocation()

    if (任务信息.执行次数 >= Number.MAX_SAFE_INTEGER - 1) {
      任务.记录日志('执行次数已达上限，重置为 0')
      任务信息.执行次数 = 0
    } else {
      任务信息.执行次数 = 任务信息.执行次数 + 1
    }

    try {
      let 上下文 = {
        任务名称: 任务.获得名称(),
        执行时间: 开始时间,
        输出日志: (...args: any[]): void => {
          任务.记录日志(...args)
        },
      }
      await 任务.任务逻辑(上下文)
    } catch (错误) {
      let 错误信息 = String(错误)
      任务.记录日志(`执行失败: ${错误信息}`)
    } finally {
      任务信息.状态 = '未启动'
    }
  }

  public async 执行(任务列表: 定时任务抽象类[]): Promise<void> {
    if (this.运行中) throw new Error('不可以多次启动')

    this.运行中 = true

    for (let 任务 of 任务列表) {
      let 表达式 = await 任务.获得cron表达式()
      let 任务名 = 任务.获得名称()

      let 任务信息: 定时任务信息 = {
        id: crypto.randomUUID(),
        名称: 任务名,
        表达式,
        状态: '未启动',
        下次执行时间: null,
        最后执行时间: null,
        执行次数: 0,
      }

      let job = schedule.scheduleJob(表达式, async () => {
        await this.执行任务(任务, 任务信息, job)
      })

      任务信息.下次执行时间 = job.nextInvocation()
      this.调度任务列表.push({ 任务, job, 信息: 任务信息 })
    }
  }

  public 取消所有任务(): void {
    for (let { job } of this.调度任务列表) job.cancel()
    this.调度任务列表 = []
    this.运行中 = false
  }

  public async 手动触发任务(任务id: string): Promise<boolean> {
    let 任务条目 = this.调度任务列表.find((item) => item.信息.id === 任务id)
    if (任务条目 === void 0) {
      return false
    }

    try {
      await this.执行任务(任务条目.任务, 任务条目.信息, 任务条目.job)
      任务条目.任务.记录日志('手动触发成功')
      return true
    } catch (错误) {
      let 错误信息 = String(错误)
      任务条目.任务.记录日志(`手动触发失败: ${错误信息}`)
      return false
    }
  }

  public 获取任务列表(): 定时任务信息[] {
    return this.调度任务列表.map((item) => ({ ...item.信息 }))
  }
  public 通过id获得任务(id: string): 定时任务抽象类 | null {
    let 任务条目 = this.调度任务列表.find((item) => item.信息.id === id)
    if (任务条目 === void 0) {
      return null
    }
    return 任务条目.任务
  }
}
