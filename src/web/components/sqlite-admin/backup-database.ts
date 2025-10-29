import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyBackupDatabase extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-backup-database', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 描述输入框: HTMLInputElement | null = null
  private 备份按钮: HTMLButtonElement | null = null
  private 结果消息: HTMLDivElement | null = null

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.padding = '20px'
    style.gap = '10px'
    style.width = '100%'

    let 标题 = document.createElement('h2')
    标题.textContent = '备份数据库'
    标题.style.fontSize = '20px'
    标题.style.fontWeight = 'bold'
    标题.style.margin = '0 0 16px 0'

    this.描述输入框 = document.createElement('input')
    this.描述输入框.type = 'text'
    this.描述输入框.placeholder = '输入备份描述...'
    this.描述输入框.style.width = '100%'
    this.描述输入框.style.padding = '8px'
    this.描述输入框.style.fontSize = '14px'
    this.描述输入框.style.marginBottom = '16px'

    this.备份按钮 = document.createElement('button')
    this.备份按钮.textContent = '开始备份'
    this.备份按钮.style.padding = '8px 16px'
    this.备份按钮.style.fontSize = '16px'
    this.备份按钮.style.backgroundColor = 'var(--主要按钮颜色)'
    this.备份按钮.style.color = '#fff'
    this.备份按钮.style.border = 'none'
    this.备份按钮.style.borderRadius = '4px'
    this.备份按钮.style.cursor = 'pointer'
    this.备份按钮.addEventListener('click', () => this.执行备份())

    this.结果消息 = document.createElement('div')
    this.结果消息.style.padding = '10px'
    this.结果消息.style.border = '1px solid var(--边框颜色)'
    this.结果消息.style.backgroundColor = 'var(--背景颜色)'
    this.结果消息.style.flex = '1'
    this.结果消息.style.marginTop = '16px'
    this.结果消息.style.fontSize = '16px'
    this.结果消息.style.color = 'var(--主要按钮颜色)'

    this.shadow.appendChild(标题)
    this.shadow.appendChild(this.描述输入框)
    this.shadow.appendChild(this.备份按钮)
    this.shadow.appendChild(this.结果消息)
  }

  private async 执行备份(): Promise<void> {
    if (this.描述输入框 === null || this.备份按钮 === null) return
    let 备份按钮 = this.备份按钮

    备份按钮.disabled = true
    备份按钮.textContent = '备份中...'

    try {
      let 结果 = await this.API管理器.请求接口('/api/sqlite-admin/backup-database', {})
      if (结果.status === 'success') {
        this.显示结果(`备份成功! 路径: ${结果.data.backupPath}`, true)
      } else {
        this.显示结果('备份失败', false)
      }
    } catch (错误) {
      console.error('备份数据库失败:', 错误)
      this.显示结果('备份数据库失败', false)
    } finally {
      备份按钮.disabled = false
      备份按钮.textContent = '开始备份'
    }
  }

  private 显示结果(消息: string, 成功: boolean): void {
    if (this.结果消息 === null) return
    let 结果消息 = this.结果消息
    结果消息.textContent = 消息
    结果消息.style.color = 成功 ? 'green' : 'red'
  }
}
