import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { LsbyLog } from '../general/log'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 日志显示组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-log-display', this)
  }

  private 日志组件 = new LsbyLog({})

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'
    this.获得宿主样式().height = '100%'
    this.获得宿主样式().display = 'flex'
    this.获得宿主样式().flexDirection = 'column'

    // 创建标题
    let 标题 = 创建元素('h2')
    标题.textContent = '系统日志'
    标题.style.margin = '0'
    标题.style.padding = '10px'
    标题.style.backgroundColor = 'var(--color-background-secondary)'
    标题.style.borderBottom = '1px solid var(--color-border)'

    // 设置日志组件样式
    this.日志组件.style.height = '100%'
    this.日志组件.style.width = '100%'

    this.shadow.appendChild(标题)
    this.shadow.appendChild(this.日志组件)

    // 初始加载日志
    await this.加载日志()
  }

  private async 加载日志(): Promise<void> {
    try {
      // 设置加载状态
      this.日志组件.设置加载状态(true)

      let 响应 = await API管理器.请求post接口并处理错误(
        '/api/log-admin/get-logs',
        {},
        async (ws数据: { 新日志: { 时间: string; 消息: string } }) => {
          this.添加新日志(ws数据.新日志)
        },
      )

      // 显示历史日志
      响应.日志列表.forEach((日志) => {
        this.添加新日志(日志)
      })

      // 隐藏加载状态
      this.日志组件.设置加载状态(false)
    } catch (错误) {
      console.error('加载日志失败:', 错误)
      this.日志组件.设置加载状态(false)
      this.日志组件.添加日志('加载日志失败')
    }
  }

  private 添加新日志(日志: { 时间: string; 消息: string }): void {
    let 日志消息 = `[${new Date(日志.时间).toLocaleString()}] ${日志.消息}`
    this.日志组件.添加日志(日志消息)
  }
}
