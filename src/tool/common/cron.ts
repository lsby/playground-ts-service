import schedule from 'node-schedule'

export class Cron {
  constructor(
    private name: string,
    private cron: `${string} ${string} ${string} ${string} ${string} ${string}`,
    private func: () => Promise<void>,
  ) {}

  getName(): string {
    return this.name
  }

  getCron(): string {
    return this.cron
  }

  async run(): Promise<void> {
    return await this.func()
  }
}

export class CronService {
  private isRun = false
  private runLog: Array<{ name: string; time: Date }> = []
  private errLog: string[] = []

  constructor(private opt?: { maxLogNum?: number }) {}

  async run(tasks: Cron[]): Promise<void> {
    if (this.isRun) throw new Error('不可以多次启动')

    var maxLogNum = this.opt?.maxLogNum || 100
    this.isRun = true
    for (const task of tasks) {
      schedule.scheduleJob(task.getCron(), () => {
        task
          .run()
          .catch((e) => {
            this.errLog.push(String(e))
            if (this.errLog.length > maxLogNum) {
              this.errLog = this.errLog.slice(maxLogNum * -1)
            }
          })
          .finally(() => {
            this.runLog.push({
              name: task.getName(),
              time: new Date(),
            })
            if (this.runLog.length > maxLogNum) {
              this.runLog = this.runLog.slice(maxLogNum * -1)
            }
          })
      })
    }
  }

  async getErrLog(): Promise<typeof this.errLog> {
    return this.errLog
  }

  async getRunLog(): Promise<typeof this.runLog> {
    return this.runLog
  }
}
