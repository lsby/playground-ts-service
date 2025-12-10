import { format } from 'node:util'
import { 已审阅的any } from '../../tools/types'
import { 集线器模型, 集线器监听器持有者 } from '../hub/hub-model'

export type 日志类型 = { 时间: Date; 消息: string }
export type 日志监听器 = (日志: 日志类型) => Promise<void>

export class 日志模型 {
  private static readonly 最大日志数量 = 1000

  private 日志列表: Array<日志类型> = []
  private 集线器 = new 集线器模型<日志类型>()

  public 获得日志列表(): Array<日志类型> {
    return [...this.日志列表]
  }

  /**
   * 注册日志监听器。
   * 若外部不再持有返回的 `监听器持有者`，监听器会在未来某个时间自动移除。
   * ⚠️ 自动清理是非确定性的，不能依赖它实现实时释放。
   */
  public 添加日志监听器(监听器: 日志监听器): 集线器监听器持有者<日志类型> {
    return this.集线器.添加监听器(监听器)
  }

  public 移除日志监听器(持有者: 集线器监听器持有者<日志类型>): void {
    this.集线器.移除监听器(持有者)
  }

  public async 记录日志(...args: 已审阅的any[]): Promise<void> {
    let 消息 = format(...args)
    let 新日志: 日志类型 = { 时间: new Date(), 消息 }
    this.日志列表.push(新日志)
    // 限制日志数量，避免内存溢出
    while (this.日志列表.length > 日志模型.最大日志数量) {
      this.日志列表.shift()
    }
    // 触发日志监听器
    await this.集线器.广播(新日志)
  }
}
