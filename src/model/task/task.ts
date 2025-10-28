import { randomUUID } from 'node:crypto'
import { 集线器 } from '../hub/hub'

export type 任务状态 = '等待中' | '运行中' | '已完成' | '已失败' | '已取消'
export type 任务优先级 = '低' | '普通' | '高' | '紧急'

export type 通知类型枚举 = { 类型: '取消请求' } | { 类型: '状态刷新' }
export type 任务上下文 = {
  任务id: string
  开始时间: Date
  通知句柄: 集线器<通知类型枚举>
}

export type 任务配置<输入类型, 输出类型> = {
  任务名称: string
  任务优先级?: 任务优先级
  任务超时时间?: number
  最大重试次数?: number
  任务逻辑: (输入: 输入类型, 上下文: 任务上下文) => Promise<输出类型>
  执行前钩子?: (输入: 输入类型) => Promise<void>
  执行成功钩子?: (输出: 输出类型) => Promise<void>
  执行失败钩子?: (错误: Error) => Promise<void>
  执行完成钩子?: () => Promise<void>
  可以重试?: () => boolean
}

export abstract class 任务抽象类<输入类型, 输出类型> {
  public static 创建任务<输入类型, 输出类型>(配置: 任务配置<输入类型, 输出类型>): 任务抽象类<输入类型, 输出类型> {
    let 任务配置 = 配置
    return new (class extends 任务抽象类<输入类型, 输出类型> {
      public 获得任务名称(): string {
        return 任务配置.任务名称
      }
      public 获得任务优先级(): 任务优先级 {
        return 任务配置.任务优先级 ?? '普通'
      }
      public 获得任务超时时间(): number {
        return 任务配置.任务超时时间 ?? 0
      }
      public 获得最大重试次数(): number {
        return 任务配置.最大重试次数 ?? 0
      }

      public async 任务逻辑(输入: 输入类型, 上下文: 任务上下文): Promise<输出类型> {
        return await 任务配置.任务逻辑(输入, 上下文)
      }

      public override async 执行前钩子(输入: 输入类型): Promise<void> {
        if (任务配置.执行前钩子 !== void 0) {
          return await 任务配置.执行前钩子(输入)
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
  private 状态: 任务状态 = '等待中'
  private 创建时间: Date = new Date()
  private 开始时间: Date | null = null
  private 结束时间: Date | null = null
  private 错误: Error | null = null
  private 重试次数: number = 0
  private 通知句柄: 集线器<通知类型枚举> = new 集线器<通知类型枚举>()

  public abstract 获得任务名称(): string
  public abstract 获得任务优先级(): 任务优先级
  public abstract 获得任务超时时间(): number
  public abstract 获得最大重试次数(): number

  public abstract 任务逻辑(输入: 输入类型, 上下文: 任务上下文): Promise<输出类型>

  public async 执行前钩子(_输入: 输入类型): Promise<void> {}
  public async 执行成功钩子(_输出: 输出类型): Promise<void> {}
  public async 执行失败钩子(_错误: Error): Promise<void> {}
  public async 执行完成钩子(): Promise<void> {}

  public 获得id(): string {
    return this.id
  }
  public 获得创建时间(): Date {
    return this.创建时间
  }

  public 获得当前状态(): 任务状态 {
    return this.状态
  }
  public 设置当前状态(状态: 任务状态): void {
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

  public 获得通知集线器(): 集线器<通知类型枚举> {
    return this.通知句柄
  }
  public 取消任务(): void {
    this.通知句柄.广播消息({ 类型: '取消请求' })
  }
}
