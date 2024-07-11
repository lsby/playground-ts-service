import schedule from 'node-schedule'
import { Task } from '@lsby/ts-fp-data'

export class Cron {
  constructor(
    private name: string,
    private cron: `${string} ${string} ${string} ${string} ${string} ${string}`,
    private func: Task<void>,
  ) {}

  getName(): string {
    return this.name
  }

  getCron(): string {
    return this.cron
  }

  getFunc(): Task<void> {
    return this.func
  }
}

export class CronService {
  private isRun = false
  private maxLogNum = 100
  private runLog: Array<{ name: string; time: Date }> = []
  private errLog: string[] = []

  constructor(private tasks: Cron[]) {}

  addTask(task: Cron): Task<void> {
    return new Task(async () => {
      this.tasks.push(task)
    })
  }

  run(): Task<void> {
    if (this.isRun) throw new Error('不可以多次启动')

    return new Task(async () => {
      this.isRun = true
      for (const task of this.tasks) {
        schedule.scheduleJob(task.getCron(), () => {
          task
            .getFunc()
            .run()
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
    })
  }

  getErrLog(): Task<typeof this.errLog> {
    return Task.pure(this.errLog)
  }

  getRunLog(): Task<typeof this.runLog> {
    return Task.pure(this.runLog)
  }
}
