import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'
import { LsbyTabsHorizontal } from '../general/tabs-horizontal'
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
  private 表名显示元素: HTMLSpanElement | null = null

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
    this.左侧容器 = 创建元素('div', {
      style: {
        flex: '0 0 250px',
        borderRight: '1px solid var(--边框颜色)',
        display: 'flex',
        flexDirection: 'column',
      },
    })

    let 左侧标题 = 创建元素('h3', {
      textContent: '表列表',
      style: {
        margin: '0',
        padding: '10px',
        borderBottom: '1px solid var(--边框颜色)',
        fontSize: '16px',
      },
    })

    this.表列表组件 = new LsbyTableList({})
    this.监听事件('选择表', async (e) => this.当选择表(e.detail.表名))

    this.左侧容器.appendChild(左侧标题)
    this.左侧容器.appendChild(this.表列表组件)

    // 右侧:表详细信息
    this.右侧容器 = 创建元素('div', {
      style: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '0',
        overflow: 'hidden',
      },
    })

    let 右侧标题容器 = 创建元素('div', {
      style: {
        padding: '10px',
        borderBottom: '1px solid var(--边框颜色)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      },
    })

    let 右侧标题 = 创建元素('h3', {
      textContent: '表详细信息',
      style: {
        margin: '0',
        fontSize: '16px',
      },
    })

    let 表名显示 = 创建元素('span', {
      textContent: '未选择表',
      style: {
        fontSize: '14px',
        color: 'var(--次要文字颜色)',
      },
    })

    右侧标题容器.appendChild(右侧标题)
    右侧标题容器.appendChild(表名显示)

    this.表名显示元素 = 表名显示

    // 右侧内容tabs
    let 内容容器 = 创建元素('div', {
      style: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0',
        overflow: 'hidden',
      },
    })

    let tabs容器 = new LsbyTabsHorizontal({})

    // 数据tab
    let 数据容器 = 创建元素('div')
    数据容器.setAttribute('标签', '数据')
    this.表数据组件 = new LsbyTableData({})
    数据容器.appendChild(this.表数据组件)

    // 结构tab
    let 结构容器 = 创建元素('div')
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
    this.当前表名 = 表名
    await 表结构组件.设置属性('表名', 表名)
    await 表数据组件.设置属性('表名', 表名)

    // 更新标题显示
    if (this.表名显示元素 !== null) {
      this.表名显示元素.textContent = ` - ${表名}`
    }
  }
}
