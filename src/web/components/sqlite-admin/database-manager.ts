import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types'
import { LsbyTableData } from './table-data'
import { LsbyTableList } from './table-list'
import { LsbyTableStructure } from './table-structure'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {
  选择表: { 表名: string }
}

export class LsbyDatabaseManager extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-database-manager', this)
  }

  private 左侧容器: HTMLDivElement | null = null
  private 右侧容器: HTMLDivElement | null = null
  private 表列表组件: LsbyTableList | null = null
  private 表结构组件: LsbyTableStructure | null = null
  private 表数据组件: LsbyTableData | null = null
  private 当前表名: string | null = null

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'row'
    style.width = '100%'
    style.height = '100%'

    // 左侧：表列表
    this.左侧容器 = document.createElement('div')
    this.左侧容器.style.flex = '0 0 250px'
    this.左侧容器.style.borderRight = '1px solid var(--边框颜色)'
    this.左侧容器.style.display = 'flex'
    this.左侧容器.style.flexDirection = 'column'

    let 左侧标题 = document.createElement('h3')
    左侧标题.textContent = '表列表'
    左侧标题.style.margin = '0'
    左侧标题.style.padding = '10px'
    左侧标题.style.borderBottom = '1px solid var(--边框颜色)'
    左侧标题.style.fontSize = '16px'

    this.表列表组件 = new LsbyTableList({})
    this.监听事件('选择表', async (e) => this.当选择表(e.detail.表名))

    this.左侧容器.appendChild(左侧标题)
    this.左侧容器.appendChild(this.表列表组件)

    // 右侧：表详细信息
    this.右侧容器 = document.createElement('div')
    this.右侧容器.style.flex = '1'
    this.右侧容器.style.display = 'flex'
    this.右侧容器.style.flexDirection = 'column'

    let 右侧标题容器 = document.createElement('div')
    右侧标题容器.style.padding = '10px'
    右侧标题容器.style.borderBottom = '1px solid var(--边框颜色)'
    右侧标题容器.style.display = 'flex'
    右侧标题容器.style.alignItems = 'center'
    右侧标题容器.style.gap = '10px'

    let 右侧标题 = document.createElement('h3')
    右侧标题.textContent = '表详细信息'
    右侧标题.style.margin = '0'
    右侧标题.style.fontSize = '16px'

    let 表名显示 = document.createElement('span')
    表名显示.textContent = '未选择表'
    表名显示.style.fontSize = '14px'
    表名显示.style.color = 'var(--次要文字颜色)'

    右侧标题容器.appendChild(右侧标题)
    右侧标题容器.appendChild(表名显示)

    // 右侧内容tabs
    let 内容容器 = document.createElement('div')
    内容容器.style.flex = '1'
    内容容器.style.display = 'flex'
    内容容器.style.flexDirection = 'column'

    let tabs容器 = document.createElement('lsby-tabs')

    // 数据tab
    let 数据容器 = document.createElement('div')
    数据容器.setAttribute('标签', '数据')
    this.表数据组件 = new LsbyTableData({})
    数据容器.appendChild(this.表数据组件)

    // 结构tab
    let 结构容器 = document.createElement('div')
    结构容器.setAttribute('标签', '结构')
    this.表结构组件 = new LsbyTableStructure({})
    结构容器.appendChild(this.表结构组件)

    tabs容器.appendChild(数据容器)
    tabs容器.appendChild(结构容器)

    内容容器.appendChild(tabs容器)

    this.右侧容器.appendChild(右侧标题容器)
    this.右侧容器.appendChild(内容容器)

    this.shadow.appendChild(this.左侧容器)
    this.shadow.appendChild(this.右侧容器)
  }

  private async 当选择表(表名: string): Promise<void> {
    if (this.表结构组件 === null || this.表数据组件 === null || this.右侧容器 === null) return
    let 表结构组件 = this.表结构组件
    let 表数据组件 = this.表数据组件
    let 右侧容器 = this.右侧容器
    this.当前表名 = 表名
    await 表结构组件.设置属性('表名', 表名)
    await 表数据组件.设置属性('表名', 表名)

    // 更新标题显示
    let 表名显示 = 右侧容器.querySelector('span')
    if (表名显示 !== null) {
      表名显示.textContent = ` - ${表名}`
    }
  }
}
