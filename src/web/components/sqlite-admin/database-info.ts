import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyDatabaseInfo extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-database-info', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 版本标签: HTMLDivElement | null = null

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.padding = '20px'
    style.gap = '15px'
    style.backgroundColor = 'var(--卡片背景颜色)'
    style.borderRadius = '8px'
    style.boxShadow = '0 2px 8px var(--深阴影颜色)'
    style.border = '1px solid var(--边框颜色)'
    style.width = '100%'

    let 标题 = document.createElement('h2')
    标题.textContent = '数据库信息'
    标题.style.margin = '0'
    标题.style.fontSize = '24px'
    标题.style.fontWeight = 'bold'
    标题.style.color = 'var(--文字颜色)'
    标题.style.borderBottom = '2px solid var(--主色调)'
    标题.style.paddingBottom = '10px'

    this.版本标签 = document.createElement('div')
    this.版本标签.style.margin = '0'
    this.版本标签.style.padding = '12px'
    this.版本标签.style.backgroundColor = 'var(--悬浮背景颜色)'
    this.版本标签.style.borderRadius = '6px'
    this.版本标签.style.border = '1px solid var(--边框颜色)'
    this.版本标签.style.fontSize = '16px'
    this.版本标签.style.color = 'var(--文字颜色)'

    this.shadow.appendChild(标题)
    this.shadow.appendChild(this.版本标签)

    await this.刷新数据()
  }

  private async 刷新数据(): Promise<void> {
    if (this.版本标签 === null) return
    let 版本标签 = this.版本标签
    try {
      let 结果 = await this.API管理器.请求post接口('/api/sqlite-admin/get-database-info', {})
      if (结果.status === 'success') {
        版本标签.textContent = `SQLite版本: ${结果.data.version}`
      } else {
        版本标签.textContent = '获取版本失败'
      }
    } catch (错误) {
      console.error('获取数据库信息失败:', 错误)
      版本标签.textContent = '获取版本失败'
    }
  }
}
