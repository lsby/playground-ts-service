import schedule from 'node-schedule'
import { Cron抽象类 } from './cron'

export class Cron管理器 {
  private 运行中 = false
  private 运行日志: Array<{ 名称: string; 时间: Date }> = []
  private 错误日志: string[] = []
  private 调度任务列表: schedule.Job[] = []

  public constructor(private 选项?: { 最大日志数量?: number }) {}

  public async 执行(任务列表: Cron抽象类[]): Promise<void> {
    if (this.运行中) throw new Error('不可以多次启动')

    let 最大日志数量 = this.选项?.最大日志数量 ?? 100
    this.运行中 = true

    for (let 任务 of 任务列表) {
      let job = schedule.scheduleJob(await 任务.getCron(), () => {
        let 任务名 = 任务.getName()
        任务.run()
          .catch((错误) => {
            this.错误日志.push(String(错误))
            if (this.错误日志.length > 最大日志数量) {
              this.错误日志 = this.错误日志.slice(-最大日志数量)
            }
          })
          .finally(() => {
            this.运行日志.push({
              名称: 任务名,
              时间: new Date(),
            })
            if (this.运行日志.length > 最大日志数量) {
              this.运行日志 = this.运行日志.slice(-最大日志数量)
            }
          })
      })

      this.调度任务列表.push(job)
    }
  }

  public 取消所有任务(): void {
    for (let job of this.调度任务列表) job.cancel()
    this.调度任务列表 = []
    this.运行中 = false
  }

  public async 获取错误日志(): Promise<string[]> {
    return this.错误日志
  }

  public async 获取运行日志(): Promise<{ 名称: string; 时间: Date }[]> {
    return this.运行日志
  }
}
