import schedule from 'node-schedule'

export class Cron {
  constructor(
    private name: string,
    private cron: `${string} ${string} ${string} ${string} ${string} ${string}`,
    private func: Promise<void>,
  ) {}

  getName(): string {
    return this.name
  }

  getCron(): string {
    return this.cron
  }

  getFunc(): Promise<void> {
    return this.func
  }
}

export class CronService {
  private isRun = false
  private maxLogNum = 100
  private runLog: Array<{ name: string; time: Date }> = []
  private errLog: string[] = []

  constructor(private tasks: Cron[]) {}

  async addTask(task: Cron): Promise<void> {
    this.tasks.push(task)
  }

  async run(): Promise<void> {
    if (this.isRun) throw new Error('不可以多次启动')
    this.isRun = true
    for (const task of this.tasks) {
      schedule.scheduleJob(task.getCron(), () => {
        task
          .getFunc()
          .then()
          .catch((e) => {
            this.errLog.push(String(e))
            if (this.errLog.length > this.maxLogNum) {
              this.errLog = this.errLog.slice(this.maxLogNum * -1)
            }
          })
          .finally(() => {
            this.runLog.push({
              name: task.getName(),
              time: new Date(),
            })
            if (this.runLog.length > this.maxLogNum) {
              this.runLog = this.runLog.slice(this.maxLogNum * -1)
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
