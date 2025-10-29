import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {}
type 发出事件类型 = {
  选择表: { 表名: string }
}
type 监听事件类型 = {}

export class LsbyTableList extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-table-list', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 表列表容器: HTMLDivElement | undefined = void 0

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    this.表列表容器 = document.createElement('div')
    this.表列表容器.style.display = 'flex'
    this.表列表容器.style.flexDirection = 'column'
    this.表列表容器.style.gap = '2px'
    this.表列表容器.style.overflowY = 'auto'
    this.表列表容器.style.flex = '1'

    this.shadow.appendChild(this.表列表容器)

    await this.刷新数据()
  }

  private async 刷新数据(): Promise<void> {
    if (this.表列表容器 === void 0) return
    let 表列表容器 = this.表列表容器
    try {
      let 结果 = await this.API管理器.请求post接口('/api/sqlite-admin/get-tables', {})
      if (结果.status === 'success') {
        this.渲染表列表(结果.data.tables)
      } else {
        表列表容器.innerHTML = ''
        let 错误消息 = document.createElement('div')
        错误消息.textContent = '获取表列表失败'
        表列表容器.appendChild(错误消息)
      }
    } catch (错误) {
      console.error('获取表列表失败:', 错误)
      表列表容器.innerHTML = ''
      let 错误消息 = document.createElement('div')
      错误消息.textContent = '获取表列表失败'
      表列表容器.appendChild(错误消息)
    }
  }

  private 渲染表列表(表列表: string[]): void {
    if (this.表列表容器 === void 0) return
    let 表列表容器 = this.表列表容器
    表列表容器.innerHTML = ''
    if (表列表.length === 0) {
      let 无表消息 = document.createElement('div')
      无表消息.textContent = '没有找到表'
      表列表容器.appendChild(无表消息)
      return
    }
    for (let 表名 of 表列表) {
      let 表项 = document.createElement('div')
      表项.textContent = 表名
      表项.style.padding = '8px 12px'
      表项.style.border = '1px solid var(--边框颜色)'
      表项.style.cursor = 'pointer'
      表项.style.backgroundColor = 'var(--背景颜色)'
      表项.style.borderRadius = '4px'
      表项.style.fontSize = '14px'
      表项.addEventListener('click', () => this.选择表(表名))
      表列表容器.appendChild(表项)
    }
  }

  private 选择表(表名: string): void {
    this.派发事件('选择表', { 表名 })
  }
}
