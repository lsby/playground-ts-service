import { format } from 'node:util'

export type 日志监听器 = (日志: { 时间: Date; 消息: string }) => void

// 监听器持有者，用于在外部持有生命周期
export class 监听器持有者 {
  public constructor(public readonly 监听器: 日志监听器) {}
}

export class 日志模型 {
  private static readonly 最大日志数量 = 1000

  // 使用 WeakRef + FinalizationRegistry 防止"反向持有" this
  private static 清理注册器 = new FinalizationRegistry<{
    实例引用: WeakRef<日志模型>
    监听器: 日志监听器
  }>(({ 实例引用, 监听器 }) => {
    let 实例 = 实例引用.deref()
    if (实例 === void 0) {
      return
    }
    let 索引 = 实例.日志监听器列表.indexOf(监听器)
    if (索引 !== -1) {
      实例.日志监听器列表.splice(索引, 1)
    }
  })

  private 日志列表: Array<{ 时间: Date; 消息: string }> = []
  private 日志监听器列表: 日志监听器[] = []
  private 持有者映射: WeakMap<监听器持有者, 日志监听器> = new WeakMap()

  public 获得日志列表(): Array<{ 时间: Date; 消息: string }> {
    return [...this.日志列表]
  }

  /**
   * 注册日志监听器。
   * 若外部不再持有返回的 `监听器持有者`，监听器会在未来某个时间自动移除。
   * ⚠️ 自动清理是非确定性的，不能依赖它实现实时释放。
   */
  public 添加日志监听器(监听器: 日志监听器): 监听器持有者 {
    this.日志监听器列表.push(监听器)

    let 持有者 = new 监听器持有者(监听器)
    this.持有者映射.set(持有者, 监听器)

    // 创建弱引用避免闭包保活 this
    let 实例弱引用 = new WeakRef(this)
    日志模型.清理注册器.register(持有者, { 实例引用: 实例弱引用, 监听器 }, 持有者)

    return 持有者
  }

  public 移除日志监听器(持有者: 监听器持有者): void {
    let 监听器 = this.持有者映射.get(持有者)
    if (监听器 === void 0) {
      return
    }

    let 索引 = this.日志监听器列表.indexOf(监听器)
    if (索引 !== -1) {
      this.日志监听器列表.splice(索引, 1)
    }

    日志模型.清理注册器.unregister(持有者)
    this.持有者映射.delete(持有者)
  }

  public 记录日志(...args: any[]): void {
    let 消息 = format(...args)
    let 新日志 = { 时间: new Date(), 消息 }
    this.日志列表.push(新日志)
    // 限制日志数量，避免内存溢出
    while (this.日志列表.length > 日志模型.最大日志数量) {
      this.日志列表.shift() // 删除最旧的日志
    }
    // 触发日志监听器
    for (let 监听器 of this.日志监听器列表) {
      监听器(新日志)
    }
  }
}
