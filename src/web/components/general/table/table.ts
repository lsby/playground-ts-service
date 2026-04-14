import { 增强样式类型 } from 'src/web/global/types/style'
import { 组件基类 } from '../../../base/base'
import { 右键菜单管理器 } from '../../../global/manager/context-menu-manager'
import { 创建元素 } from '../../../global/tools/create-element'
import { 普通按钮 } from '../base/base-button'
import { 分页组件, 数据表分页配置 } from '../pagination/pagination'
import { 渲染表体, 渲染表头, 渲染顶部操作区, 表格渲染上下文 } from './render-helper'
import { 表格选择管理器 } from './selection-handler'
import {
  发出事件类型,
  属性类型,
  数据表列配置,
  数据表加载数据参数,
  数据表操作配置,
  数据表格选项,
  监听事件类型,
  顶部操作配置,
} from './types'

export class 表格组件<数据项> extends 组件基类<属性类型, 发出事件类型<数据项>, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-table', this)
  }

  private 列配置: 数据表列配置<数据项>[]
  private 操作列表: 数据表操作配置<数据项>[]
  private 顶部操作列表: 顶部操作配置[]
  private 加载数据回调: (参数: 数据表加载数据参数<数据项>) => Promise<{ 数据: 数据项[]; 总数: number }>
  private 数据列表: 数据项[] = []
  private 分页配置: 数据表分页配置
  private 排序列表: { field: keyof 数据项; direction: 'asc' | 'desc' }[] = []
  private 筛选条件: Record<string, string> = {}
  private 是否加载中: boolean = false
  private 是否正在拖动: boolean = false
  private 拖动列索引: number = -1
  private 拖动起始X: number = 0
  private 拖动起始宽度: number = 0
  private 列最小宽度: string = '50px'
  private 列最大宽度: string | undefined = undefined
  private 表格行元素映射: Map<number, HTMLTableRowElement> = new Map()
  private 表格单元格元素映射: Map<string, HTMLTableCellElement> = new Map()
  private 表头元素映射: Map<number, HTMLElement> = new Map()
  private 列单元格映射: Map<number, HTMLElement[]> = new Map()
  private 分页组件: 分页组件 | null = null
  private 宿主样式: 增强样式类型 | undefined
  private 选择管理器: 表格选择管理器<数据项>

  private 处理鼠标移动 = (event: MouseEvent): void => {
    if (this.是否正在拖动 === false) return
    let 差值 = event.clientX - this.拖动起始X
    let 新宽度 = Math.max(50, this.拖动起始宽度 + 差值)
    let th = this.表头元素映射.get(this.拖动列索引)
    let tds = this.列单元格映射.get(this.拖动列索引) ?? []
    if (th !== undefined) {
      th.style.width = `${新宽度}px`
      if (差值 > 0) th.style.maxWidth = `${新宽度}px`
      else if (差值 < 0) th.style.minWidth = `${新宽度}px`
    }
    for (let td of tds) {
      td.style.width = `${新宽度}px`
      if (差值 > 0) td.style.maxWidth = `${新宽度}px`
      else if (差值 < 0) td.style.minWidth = `${新宽度}px`
    }
  }

  private 处理鼠标释放 = (): void => {
    this.是否正在拖动 = false
    this.拖动列索引 = -1
    document.onmousemove = null
    document.onmouseup = null
  }

  public constructor(选项: 数据表格选项<数据项>) {
    super()
    this.列配置 = 选项.列配置
    this.操作列表 = 选项.操作列表 ?? []
    this.顶部操作列表 = 选项.顶部操作列表 ?? []
    this.加载数据回调 = 选项.加载数据
    this.列最小宽度 = 选项.列最小宽度 ?? '50px'
    this.列最大宽度 = 选项.列最大宽度
    this.宿主样式 = 选项.宿主样式
    this.分页配置 = { 当前页码: 1, 每页数量: 选项.每页数量 ?? 10, 总数量: 0 }
    this.选择管理器 = new 表格选择管理器({
      数据列表: this.数据列表,
      列配置: this.列配置,
      表格行元素映射: this.表格行元素映射,
      表格单元格元素映射: this.表格单元格元素映射,
      通知更新: async (): Promise<void> => {
        await this.渲染()
      },
    })
  }

  public 获得当前页码(): number {
    return this.分页配置.当前页码
  }
  public 获得每页数量(): number {
    return this.分页配置.每页数量
  }
  public async 刷新数据(): Promise<void> {
    await this.加载数据()
  }

  private 显示右键菜单(x: number, y: number): void {
    右键菜单管理器.获得实例().显示菜单(x, y, [
      {
        文本: '复制',
        回调: async (): Promise<void> => {
          await this.选择管理器.复制选中内容()
        },
      },
    ])
  }

  private async 加载数据(): Promise<void> {
    if (this.是否加载中) return
    try {
      this.是否加载中 = true
      右键菜单管理器.获得实例().隐藏菜单()
      this.选择管理器.清除选择()
      let { 数据, 总数 } = await this.加载数据回调({
        页码: this.分页配置.当前页码,
        每页数量: this.分页配置.每页数量,
        排序列表: this.排序列表,
        筛选条件: this.筛选条件,
      })
      this.分页配置.总数量 = 总数
      let 总页数 = Math.ceil(总数 / this.分页配置.每页数量)
      if (总页数 === 0) {
        this.分页配置.当前页码 = 1
        this.数据列表.splice(0, this.数据列表.length, ...数据)
      } else if (this.分页配置.当前页码 > 总页数) {
        this.分页配置.当前页码 = 总页数
        let { 数据: 新数据, 总数: 新总数 } = await this.加载数据回调({
          页码: this.分页配置.当前页码,
          每页数量: this.分页配置.每页数量,
          排序列表: this.排序列表,
          筛选条件: this.筛选条件,
        })
        this.数据列表.splice(0, this.数据列表.length, ...新数据)
        this.分页配置.总数量 = 新总数
      } else {
        this.数据列表.splice(0, this.数据列表.length, ...数据)
      }
      await this.渲染()
    } finally {
      this.是否加载中 = false
      if (this.分页组件 !== null) this.分页组件.更新配置(this.分页配置, this.是否加载中)
    }
  }

  private async 渲染(): Promise<void> {
    this.表格行元素映射.clear()
    this.表格单元格元素映射.clear()
    this.表头元素映射.clear()
    this.列单元格映射.clear()
    let 有可扩展列 = this.列配置.some((列) => 列.列最大宽度 === undefined && this.列最大宽度 === undefined)
    let 操作列宽度列表: number[] = []
    for (let 操作 of this.操作列表) {
      let 临时按钮 = new 普通按钮({
        文本: 操作.名称,
        宿主样式: { visibility: 'hidden', position: 'absolute', top: '-1000px' },
        元素样式: { padding: '4px 12px' },
      })
      document.body.appendChild(临时按钮)
      await new Promise((resolve) => setTimeout(resolve, 0))
      操作列宽度列表.push(临时按钮.offsetWidth + 16)
      document.body.removeChild(临时按钮)
    }

    let 容器 = 创建元素('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } })
    let 上下文: 表格渲染上下文<数据项> = {
      列配置: this.列配置,
      数据列表: this.数据列表,
      操作列表: this.操作列表,
      顶部操作列表: this.顶部操作列表,
      筛选条件: this.筛选条件,
      排序列表: this.排序列表,
      选中的行: this.选择管理器.获得选中的行(),
      最后点击的单元格: this.选择管理器.获得最后点击的单元格(),
      多选模式: this.选择管理器.获得是否为多选模式(),
      列最小宽度: this.列最小宽度,
      列最大宽度: this.列最大宽度,
      表格行元素映射: this.表格行元素映射,
      表格单元格元素映射: this.表格单元格元素映射,
      表头元素映射: this.表头元素映射,
      列单元格映射: this.列单元格映射,
      是否正在拖动: this.是否正在拖动,
      加载数据: async () => {
        await this.加载数据()
      },
      刷新数据: async () => {
        await this.刷新数据()
      },
      处理鼠标移动: this.处理鼠标移动,
      处理鼠标释放: this.处理鼠标释放,
      处理行点击: (行, ctrl, shift) => this.选择管理器.处理行点击(行, ctrl, shift),
      处理单元格点击: (行, 列, ctrl, shift) => this.选择管理器.处理单元格点击(行, 列, ctrl, shift),
      更新选中状态: () => this.选择管理器.更新选中状态(),
      显示右键菜单: (x, y) => this.显示右键菜单(x, y),
      设置状态: (状态): void => {
        if (typeof 状态.拖动列索引 === 'number') this.拖动列索引 = 状态.拖动列索引
        if (typeof 状态.拖动起始X === 'number') this.拖动起始X = 状态.拖动起始X
        if (typeof 状态.拖动起始宽度 === 'number') this.拖动起始宽度 = 状态.拖动起始宽度
        if (typeof 状态.是否正在拖动 === 'boolean') this.是否正在拖动 = 状态.是否正在拖动
      },
    }

    let 顶部操作区 = 渲染顶部操作区(上下文)
    if (顶部操作区 !== null) 容器.appendChild(顶部操作区)

    let 表格包装器 = 创建元素('div', { style: { overflowX: 'auto', width: '100%' } })
    let 表格元素 = 创建元素('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid var(--边框颜色)',
        tableLayout: 有可扩展列 ? 'fixed' : 'auto',
        userSelect: 'none',
      },
    })
    表格元素.appendChild(await 渲染表头(上下文, 操作列宽度列表))
    表格元素.appendChild(渲染表体(上下文, 操作列宽度列表))
    表格包装器.appendChild(表格元素)
    容器.appendChild(表格包装器)

    if (this.分页组件 === null) {
      this.分页组件 = new 分页组件(this.分页配置, this.是否加载中)
      this.分页组件.on页码变化 = async (数据): Promise<void> => {
        this.分页配置.当前页码 = 数据.页码
        await this.加载数据()
      }
    } else {
      this.分页组件.更新配置(this.分页配置, this.是否加载中)
    }
    容器.appendChild(this.分页组件)

    this.shadow.innerHTML = ''
    this.shadow.appendChild(容器)
  }

  protected override async 当加载时(): Promise<void> {
    if (this.宿主样式 !== undefined) {
      for (let [键, 值] of Object.entries(this.宿主样式)) {
        if (typeof 值 === 'string') this.style.setProperty(键, 值)
      }
    }
    await this.加载数据()
  }
}
