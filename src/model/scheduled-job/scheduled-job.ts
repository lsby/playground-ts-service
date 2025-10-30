import { format } from 'node:util'

export type 定时任务日志监听器 = (日志: { 时间: Date; 消息: string }) => void
export type 定时任务上下文 = {
  任务名称: string
  执行时间: Date
  输出日志: (...args: any[]) => void
}

export abstract class 定时任务抽象类 {
  private static readonly 最大日志数量 = 1000 // 限制日志最大数量，避免内存溢出

  public static 创建定时任务(配置: {
    名称: string
    定时表达式: `${string} ${string} ${string} ${string} ${string} ${string}`
    任务逻辑: (上下文: 定时任务上下文) => Promise<void>
  }): 定时任务抽象类 {
    return new (class extends 定时任务抽象类 {
      public 获得名称(): string {
        return 配置.名称
      }

      public async 获得cron表达式(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`> {
        return 配置.定时表达式
      }

      public async 任务逻辑(上下文: 定时任务上下文): Promise<void> {
        await 配置.任务逻辑(上下文)
      }
    })()
  }

  private 日志列表: Array<{ 时间: Date; 消息: string }> = []
  private 定时任务日志监听器: 定时任务日志监听器 | null = null

  public abstract 获得名称(): string
  public abstract 获得cron表达式(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`>
  public abstract 任务逻辑(上下文: 定时任务上下文): Promise<void>

  public 获得日志列表(): Array<{ 时间: Date; 消息: string }> {
    return [...this.日志列表]
  }

  public 设置定时任务日志监听器(监听器: 定时任务日志监听器 | null): void {
    this.定时任务日志监听器 = 监听器
  }

  public 记录日志(...args: any[]): void {
    let 消息 = format(...args)
    let 新日志 = { 时间: new Date(), 消息 }
    this.日志列表.push(新日志)
    // 限制日志数量，避免内存溢出
    while (this.日志列表.length > 定时任务抽象类.最大日志数量) {
      this.日志列表.shift() // 删除最旧的日志
    }
    // 触发定时任务日志监听器
    if (this.定时任务日志监听器 !== null) {
      this.定时任务日志监听器(新日志)
    }
  }
}
