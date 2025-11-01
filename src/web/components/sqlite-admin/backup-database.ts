import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 联合转元组 } from '../../global/types/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyBackupDatabase extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-backup-database', this)
  }

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

    let 标题 = 创建元素('h2', {
      textContent: '备份数据库',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
      },
    })

    this.备份按钮 = 创建元素('button', {
      textContent: '开始备份',
      style: {
        padding: '8px 16px',
        fontSize: '16px',
        backgroundColor: 'var(--主要按钮颜色)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    })
    this.备份按钮.addEventListener('click', () => this.执行备份())

    this.结果消息 = 创建元素('div', {
      style: {
        padding: '10px',
        border: '1px solid var(--边框颜色)',
        backgroundColor: 'var(--背景颜色)',
        flex: '1',
        marginTop: '16px',
        fontSize: '16px',
        color: 'var(--主要按钮颜色)',
      },
    })

    this.shadow.appendChild(标题)
    this.shadow.appendChild(this.备份按钮)
    this.shadow.appendChild(this.结果消息)
  }

  private async 执行备份(): Promise<void> {
    if (this.备份按钮 === null) return
    let 备份按钮 = this.备份按钮

    备份按钮.disabled = true
    备份按钮.textContent = '备份中...'

    try {
      let 结果 = await API管理器.请求post接口('/api/sqlite-admin/backup-database', {})
      if (结果.status === 'success') {
        this.显示结果(`备份成功`, true)
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
