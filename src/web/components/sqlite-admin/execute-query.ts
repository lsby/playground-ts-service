import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'
import { 共享表格管理器 } from './shared-table'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

type 选项卡数据 = {
  id: string
  标题: string
  sql: string
  结果数据: any
}

export class LsbyExecuteQuery extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-execute-query', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 选项卡列表: 选项卡数据[] = []
  private 当前选项卡索引: number = 0
  private 选项卡头容器: HTMLDivElement = document.createElement('div')
  private 内容容器: HTMLDivElement = document.createElement('div')
  private 添加选项卡按钮: HTMLButtonElement = document.createElement('button')
  private 选项卡内容映射: Map<
    string,
    {
      sql输入: HTMLTextAreaElement
      执行按钮: HTMLButtonElement
      结果容器: HTMLDivElement
      表格管理器: 共享表格管理器 | null
    }
  > = new Map()

  public constructor(属性: 属性类型) {
    super(属性)
    this.添加默认选项卡()
  }

  private 添加默认选项卡(): void {
    let id = this.生成选项卡Id()
    this.选项卡列表.push({
      id,
      标题: '查询1',
      sql: '',
      结果数据: null,
    })
  }

  private 生成选项卡Id(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'
    style.overflow = 'hidden'

    // 选项卡头部容器
    this.选项卡头容器.style.display = 'flex'
    this.选项卡头容器.style.borderBottom = '1px solid var(--边框颜色)'
    this.选项卡头容器.style.gap = '10px'
    this.选项卡头容器.style.padding = '10px'
    this.选项卡头容器.style.overflowX = 'auto'

    // 添加 选项卡 按钮
    this.添加选项卡按钮.textContent = '+'
    this.添加选项卡按钮.style.padding = '6px'
    this.添加选项卡按钮.style.border = '1px solid var(--边框颜色)'
    this.添加选项卡按钮.style.backgroundColor = 'var(--背景颜色)'
    this.添加选项卡按钮.style.color = 'var(--文字颜色)'
    this.添加选项卡按钮.style.cursor = 'pointer'
    this.添加选项卡按钮.style.fontSize = '14px'
    this.添加选项卡按钮.style.borderRadius = '4px'
    this.添加选项卡按钮.addEventListener('click', () => this.添加选项卡())

    // 内容容器
    this.内容容器.style.flex = '1'
    this.内容容器.style.display = 'flex'
    this.内容容器.style.flexDirection = 'column'
    this.内容容器.style.overflow = 'hidden'

    this.shadow.appendChild(this.选项卡头容器)
    this.shadow.appendChild(this.内容容器)

    this.更新UI()
  }

  private 更新UI(): void {
    this.更新选项卡头部()
    this.更新选项卡内容()
  }

  private 更新选项卡头部(): void {
    this.选项卡头容器.innerHTML = ''

    this.选项卡列表.forEach((选项卡, 索引) => {
      let 选项卡按钮 = document.createElement('div')
      选项卡按钮.style.display = 'flex'
      选项卡按钮.style.alignItems = 'center'
      选项卡按钮.style.gap = '5px'
      选项卡按钮.style.padding = '6px 12px'
      选项卡按钮.style.border = 索引 === this.当前选项卡索引 ? '1px solid var(--主色调)' : '1px solid var(--边框颜色)'
      选项卡按钮.style.borderBottom = 索引 === this.当前选项卡索引 ? 'none' : '1px solid var(--边框颜色)'
      选项卡按钮.style.backgroundColor = 索引 === this.当前选项卡索引 ? 'var(--主色调)' : 'var(--背景颜色)'
      选项卡按钮.style.color = 索引 === this.当前选项卡索引 ? 'white' : 'var(--文字颜色)'
      选项卡按钮.style.cursor = 'pointer'
      选项卡按钮.style.borderRadius = '4px 4px 0 0'
      选项卡按钮.style.userSelect = 'none'

      let 标题span = document.createElement('span')
      标题span.textContent = 选项卡.标题
      标题span.style.flex = '1'

      let 关闭按钮 = document.createElement('button')
      关闭按钮.textContent = '×'
      关闭按钮.style.padding = '4px'
      关闭按钮.style.cursor = 'pointer'
      关闭按钮.style.border = 'none'
      关闭按钮.style.background = 'none'
      关闭按钮.style.color = 'inherit'
      关闭按钮.style.fontSize = '16px'
      关闭按钮.style.lineHeight = '1'
      关闭按钮.style.width = '16px'
      关闭按钮.style.height = '16px'
      关闭按钮.style.display = 'flex'
      关闭按钮.style.alignItems = 'center'
      关闭按钮.style.justifyContent = 'center'
      关闭按钮.addEventListener('click', (e) => {
        e.stopPropagation()
        this.删除选项卡(索引)
      })

      选项卡按钮.appendChild(标题span)
      选项卡按钮.appendChild(关闭按钮)
      选项卡按钮.addEventListener('click', () => this.切换选项卡(索引))

      this.选项卡头容器.appendChild(选项卡按钮)
    })

    this.选项卡头容器.appendChild(this.添加选项卡按钮)
  }

  private 更新选项卡内容(): void {
    this.内容容器.innerHTML = ''

    if (this.选项卡列表.length === 0) return

    let 当前选项卡 = this.选项卡列表[this.当前选项卡索引]
    if (当前选项卡 === void 0) return

    let 内容 = this.获取或创建选项卡内容(当前选项卡.id)

    this.内容容器.appendChild(内容.sql输入)
    this.内容容器.appendChild(内容.执行按钮)
    this.内容容器.appendChild(内容.结果容器)

    // 更新 SQL 输入框的值
    内容.sql输入.value = 当前选项卡.sql

    // 如果有结果数据，显示结果
    if (当前选项卡.结果数据 !== null) {
      this.显示查询结果(内容, 当前选项卡.结果数据)
    }
  }

  private 获取或创建选项卡内容(tabId: string): {
    sql输入: HTMLTextAreaElement
    执行按钮: HTMLButtonElement
    结果容器: HTMLDivElement
    表格管理器: 共享表格管理器 | null
  } {
    let 内容 = this.选项卡内容映射.get(tabId)
    if (内容 !== void 0) {
      return 内容
    }

    let sql输入 = document.createElement('textarea')
    sql输入.placeholder = '输入SQL语句...'
    sql输入.style.width = '100%'
    sql输入.style.height = '100px'
    sql输入.style.margin = '10px 0'
    sql输入.style.padding = '8px'
    sql输入.style.fontFamily = 'monospace'
    sql输入.style.fontSize = '14px'
    sql输入.style.border = '1px solid var(--边框颜色)'
    sql输入.style.backgroundColor = 'var(--背景颜色)'
    sql输入.style.color = 'var(--文字颜色)'
    sql输入.style.resize = 'vertical'
    sql输入.style.outline = 'none'

    let 执行按钮 = document.createElement('button')
    执行按钮.textContent = '执行'
    执行按钮.style.padding = '8px 16px'
    执行按钮.style.fontSize = '14px'
    执行按钮.style.cursor = 'pointer'
    执行按钮.style.alignSelf = 'flex-start'
    执行按钮.style.marginBottom = '10px'
    执行按钮.addEventListener('click', () => this.查询(tabId))

    let 结果容器 = document.createElement('div')
    结果容器.style.border = '1px solid var(--边框颜色)'
    结果容器.style.overflow = 'auto'
    结果容器.style.backgroundColor = 'var(--背景颜色)'
    结果容器.style.minWidth = '0'
    结果容器.style.flex = '1 1 0'
    结果容器.style.display = 'flex'
    结果容器.style.flexDirection = 'column'
    结果容器.style.position = 'relative'

    let 新内容 = { sql输入, 执行按钮, 结果容器, 表格管理器: null }
    this.选项卡内容映射.set(tabId, 新内容)
    return 新内容
  }

  private 切换选项卡(index: number): void {
    if (index < 0 || index >= this.选项卡列表.length) return
    this.当前选项卡索引 = index
    this.更新UI()
  }

  private 添加选项卡(): void {
    let id = this.生成选项卡Id()
    let 选项卡编号 = this.选项卡列表.length + 1
    this.选项卡列表.push({
      id,
      标题: `查询${选项卡编号}`,
      sql: '',
      结果数据: null,
    })
    this.当前选项卡索引 = this.选项卡列表.length - 1
    this.更新UI()
  }

  private 删除选项卡(index: number): void {
    if (this.选项卡列表.length <= 1) return // 至少保留一个 选项卡
    if (index < 0 || index >= this.选项卡列表.length) return

    let 选项卡 = this.选项卡列表[index]
    if (选项卡 === void 0) return

    let 选项卡Id = 选项卡.id
    this.选项卡列表.splice(index, 1)
    this.选项卡内容映射.delete(选项卡Id)

    if (this.当前选项卡索引 >= this.选项卡列表.length) {
      this.当前选项卡索引 = this.选项卡列表.length - 1
    }

    this.更新UI()
  }

  private async 查询(tabId: string): Promise<void> {
    let 选项卡 = this.选项卡列表.find((t) => t.id === tabId)
    if (选项卡 === void 0) return

    let 内容 = this.选项卡内容映射.get(tabId)
    if (内容 === void 0) return

    let sql = 内容.sql输入.value.trim()
    选项卡.sql = sql // 保存 SQL 到 选项卡 数据

    if (sql === '') {
      this.显示结果(内容, '请输入SQL语句')
      return
    }

    try {
      let 结果 = await this.API管理器.请求post接口('/api/sqlite-admin/execute-query', { sql, parameters: [] })
      if (结果.status === 'success') {
        选项卡.结果数据 = 结果.data
        this.显示查询结果(内容, 结果.data)
      } else {
        this.显示结果(内容, '查询失败')
      }
    } catch (错误) {
      console.error('查询失败:', 错误)
      this.显示结果(内容, '查询失败')
    }
  }

  private 显示查询结果(
    内容: {
      sql输入: HTMLTextAreaElement
      执行按钮: HTMLButtonElement
      结果容器: HTMLDivElement
      表格管理器: 共享表格管理器 | null
    },
    数据: {
      rows: Record<string, any>[]
      numAffectedRows?: number | undefined
      insertId?: any
    },
  ): void {
    if (数据.rows.length === 0) {
      // 清空所有内容
      内容.结果容器.innerHTML = ''
      let 无结果消息 = document.createElement('div')
      无结果消息.textContent = '查询无结果'
      无结果消息.style.padding = '20px'
      无结果消息.style.textAlign = 'center'
      无结果消息.style.color = 'var(--次要文字颜色)'

      内容.结果容器.appendChild(无结果消息)

      if (数据.numAffectedRows !== void 0) {
        let 影响行数消息 = document.createElement('div')
        影响行数消息.textContent = `影响行数: ${数据.numAffectedRows}`
        影响行数消息.style.fontWeight = 'bold'
        影响行数消息.style.marginTop = '10px'

        内容.结果容器.appendChild(影响行数消息)
      }
      return
    }

    // 如果表格管理器还未创建，现在创建
    if (内容.表格管理器 === null) {
      内容.表格管理器 = new 共享表格管理器(内容.结果容器, { 可编辑: false })
    }

    // 使用表格管理器显示数据
    内容.表格管理器.更新数据(数据.rows)

    // 如果有影响行数，添加到底部
    if (数据.numAffectedRows !== void 0) {
      // 先移除旧的影响行数消息
      let 旧消息 = 内容.结果容器.querySelector('.影响行数消息')
      if (旧消息 !== null) {
        旧消息.remove()
      }

      let 影响行数消息 = document.createElement('div')
      影响行数消息.className = '影响行数消息'
      影响行数消息.textContent = `影响行数: ${数据.numAffectedRows}`
      影响行数消息.style.padding = '10px'
      影响行数消息.style.fontWeight = 'bold'
      影响行数消息.style.borderTop = '1px solid var(--边框颜色)'

      内容.结果容器.appendChild(影响行数消息)
    }
  }

  private 显示结果(
    内容: {
      sql输入: HTMLTextAreaElement
      执行按钮: HTMLButtonElement
      结果容器: HTMLDivElement
      表格管理器: 共享表格管理器 | null
    },
    消息: string,
  ): void {
    内容.结果容器.innerHTML = ''
    let 消息元素 = document.createElement('div')
    消息元素.textContent = 消息
    消息元素.style.padding = '10px'
    消息元素.style.backgroundColor = 'var(--背景颜色)'

    内容.结果容器.appendChild(消息元素)
  }
}
