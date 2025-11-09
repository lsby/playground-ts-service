import { format } from 'node:util'

export type 定时任务日志监听器 = (日志: { 时间: Date; 消息: string }) => void

export type 定时任务上下文 = {
  任务名称: string
  执行时间: Date
  输出日志: (...args: any[]) => void
}

// 监听器持有者，用于在外部持有生命周期
export class 监听器持有者 {
  public constructor(public readonly 监听器: 定时任务日志监听器) {}
}

export abstract class 定时任务抽象类 {
  private static readonly 最大日志数量 = 1000

  // 使用 WeakRef + FinalizationRegistry 防止“反向持有” this
  private static 清理注册器 = new FinalizationRegistry<{
    实例引用: WeakRef<定时任务抽象类>
    监听器: 定时任务日志监听器
  }>(({ 实例引用, 监听器 }) => {
    let 实例 = 实例引用.deref()
    if (实例 === void 0) {
      return
    }
    let 索引 = 实例.定时任务日志监听器列表.indexOf(监听器)
    if (索引 !== -1) {
      实例.定时任务日志监听器列表.splice(索引, 1)
    }
  })
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
  private 定时任务日志监听器列表: 定时任务日志监听器[] = []
  private 持有者映射: WeakMap<监听器持有者, 定时任务日志监听器> = new WeakMap()

  public abstract 获得名称(): string
  public abstract 获得cron表达式(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`>
  public abstract 任务逻辑(上下文: 定时任务上下文): Promise<void>

  public 获得日志列表(): Array<{ 时间: Date; 消息: string }> {
    return [...this.日志列表]
  }

  /**
   * 注册日志监听器。
   * 若外部不再持有返回的 `监听器持有者`，监听器会在未来某个时间自动移除。
   * ⚠️ 自动清理是非确定性的，不能依赖它实现实时释放。
   */
  public 添加定时任务日志监听器(监听器: 定时任务日志监听器): 监听器持有者 {
    this.定时任务日志监听器列表.push(监听器)

    let 持有者 = new 监听器持有者(监听器)
    this.持有者映射.set(持有者, 监听器)

    // 创建弱引用避免闭包保活 this
    let 实例弱引用 = new WeakRef(this)
    定时任务抽象类.清理注册器.register(持有者, { 实例引用: 实例弱引用, 监听器 }, 持有者)

    return 持有者
  }

  public 移除定时任务日志监听器(持有者: 监听器持有者): void {
    let 监听器 = this.持有者映射.get(持有者)
    if (监听器 === void 0) {
      return
    }

    let 索引 = this.定时任务日志监听器列表.indexOf(监听器)
    if (索引 !== -1) {
      this.定时任务日志监听器列表.splice(索引, 1)
    }

    定时任务抽象类.清理注册器.unregister(持有者)
    this.持有者映射.delete(持有者)
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
    for (let 监听器 of this.定时任务日志监听器列表) {
      监听器(新日志)
    }
  }
}
