import { randomUUID } from 'node:crypto'
import { format } from 'node:util'

export type 即时任务状态 = '等待中' | '运行中' | '已完成' | '已失败'
export type 即时任务优先级 = number // 数字越大 优先级越高

export type 即时任务日志监听器 = (日志: { 时间: Date; 消息: string }) => void
export type 即时任务上下文 = {
  任务id: string
  开始时间: Date
  输出日志: (...args: any[]) => void
}

export abstract class 即时任务抽象类<输出类型> {
  private static readonly 最大日志数量 = 1000 // 限制日志最大数量，避免内存溢出
  public static 创建任务<输出类型>(配置: {
    任务名称: string
    即时任务优先级?: 即时任务优先级
    最大重试次数?: number
    任务逻辑: (上下文: 即时任务上下文) => Promise<输出类型>
    执行前钩子?: () => Promise<void>
    执行成功钩子?: (输出: 输出类型) => Promise<void>
    执行失败钩子?: (错误: Error) => Promise<void>
    执行完成钩子?: () => Promise<void>
    可以重试?: () => boolean
  }): 即时任务抽象类<输出类型> {
    let 任务配置 = 配置
    return new (class extends 即时任务抽象类<输出类型> {
      public 获得任务名称(): string {
        return 任务配置.任务名称
      }
      public 获得即时任务优先级(): 即时任务优先级 {
        return 任务配置.即时任务优先级 ?? 2
      }
      public 获得最大重试次数(): number {
        return 任务配置.最大重试次数 ?? 0
      }

      public async 任务逻辑(上下文: 即时任务上下文): Promise<输出类型> {
        return await 任务配置.任务逻辑(上下文)
      }

      public override async 执行前钩子(): Promise<void> {
        if (任务配置.执行前钩子 !== void 0) {
          return await 任务配置.执行前钩子()
        }
      }
      public override async 执行成功钩子(输出: 输出类型): Promise<void> {
        if (任务配置.执行成功钩子 !== void 0) {
          return await 任务配置.执行成功钩子(输出)
        }
      }
      public override async 执行失败钩子(错误: Error): Promise<void> {
        if (任务配置.执行失败钩子 !== void 0) {
          return await 任务配置.执行失败钩子(错误)
        }
      }
      public override async 执行完成钩子(): Promise<void> {
        if (任务配置.执行完成钩子 !== void 0) {
          return await 任务配置.执行完成钩子()
        }
      }
    })()
  }

  private id: string = randomUUID()
  private 状态: 即时任务状态 = '等待中'
  private 创建时间: Date = new Date()
  private 开始时间: Date | null = null
  private 结束时间: Date | null = null
  private 错误: Error | null = null
  private 重试次数: number = 0
  private 输出结果: 输出类型 | null = null
  private 日志列表: Array<{ 时间: Date; 消息: string }> = []
  private 即时任务日志监听器: 即时任务日志监听器 | null = null

  public abstract 获得任务名称(): string
  public abstract 获得即时任务优先级(): 即时任务优先级
  public abstract 获得最大重试次数(): number

  public abstract 任务逻辑(上下文: 即时任务上下文): Promise<输出类型>

  public async 执行前钩子(): Promise<void> {}
  public async 执行成功钩子(_输出: 输出类型): Promise<void> {}
  public async 执行失败钩子(_错误: Error): Promise<void> {}
  public async 执行完成钩子(): Promise<void> {}

  public 获得id(): string {
    return this.id
  }
  public 获得创建时间(): Date {
    return this.创建时间
  }

  public 获得当前状态(): 即时任务状态 {
    return this.状态
  }
  public 设置当前状态(状态: 即时任务状态): void {
    this.状态 = 状态
  }

  public 获得开始时间(): Date | null {
    return this.开始时间
  }
  public 设置开始时间(时间: Date): void {
    this.开始时间 = 时间
  }

  public 获得结束时间(): Date | null {
    return this.结束时间
  }
  public 设置结束时间(时间: Date): void {
    this.结束时间 = 时间
  }

  public 获得执行时长(): number | null {
    if (this.开始时间 === null) {
      return null
    }
    let 结束 = this.结束时间 ?? new Date()
    return 结束.getTime() - this.开始时间.getTime()
  }

  public 获得错误信息(): Error | null {
    return this.错误
  }
  public 设置错误信息(错误: Error): void {
    this.错误 = 错误
  }

  public 可以重试(): boolean {
    return this.重试次数 < this.获得最大重试次数()
  }
  public 获得当前重试次数(): number {
    return this.重试次数
  }
  public 增加重试次数(): void {
    this.重试次数 = this.重试次数 + 1
  }

  public 获得输出结果(): 输出类型 | null {
    return this.输出结果
  }
  public 设置输出结果(结果: 输出类型): void {
    this.输出结果 = 结果
  }

  public 获得日志列表(): Array<{ 时间: Date; 消息: string }> {
    return [...this.日志列表]
  }

  public 设置即时任务日志监听器(监听器: 即时任务日志监听器 | null): void {
    this.即时任务日志监听器 = 监听器
  }

  public 记录日志(...args: any[]): void {
    let 消息 = format(...args)
    let 新日志 = { 时间: new Date(), 消息 }
    this.日志列表.push(新日志)
    // 限制日志数量，避免内存溢出
    while (this.日志列表.length > 即时任务抽象类.最大日志数量) {
      this.日志列表.shift() // 删除最旧的日志
    }
    // 触发即时任务日志监听器
    if (this.即时任务日志监听器 !== null) {
      this.即时任务日志监听器(新日志)
    }
  }
}
