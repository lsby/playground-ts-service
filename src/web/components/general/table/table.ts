import { 组件基类 } from '../../../base/base'
import { 右键菜单管理器 } from '../../../global/manager/context-menu-manager'
import { 显示输入对话框 } from '../../../global/manager/dialog-manager'
import { 创建元素, 增强样式类型 } from '../../../global/tools/create-element'
import { 普通按钮 } from '../base/base-button'
import { 分页组件, 数据表分页配置 } from '../pagination/pagination'

export type 数据表列配置<数据项> = {
  字段名: keyof 数据项
  显示名: string
  格式化?: (值: unknown) => string
  可排序?: boolean
  可筛选?: boolean
  列最小宽度?: string
  列最大宽度?: string
}

export type 数据表操作配置<数据项> = {
  名称: string
  回调: (数据项: 数据项) => Promise<void>
}

export type 顶部操作配置 = {
  名称: string
  回调: () => Promise<void>
}

export type 数据表加载数据参数<数据项> = {
  页码: number
  每页数量: number
  排序列表?: { field: keyof 数据项; direction: 'asc' | 'desc' }[]
  筛选条件?: Record<string, string>
}

export type 数据表格选项<数据项> = {
  列配置: 数据表列配置<数据项>[]
  操作列表?: 数据表操作配置<数据项>[]
  顶部操作列表?: 顶部操作配置[]
  每页数量?: number
  列最小宽度?: string
  列最大宽度?: string
  宿主样式?: 增强样式类型
  加载数据: (参数: 数据表加载数据参数<数据项>) => Promise<{ 数据: 数据项[]; 总数: number }>
}

type 属性类型 = {}

type 发出事件类型<数据项> = {
  操作点击: { 操作名: string; 数据项: 数据项 }
  页码变化: { 页码: number }
}

type 监听事件类型 = {}

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
  private 列最大宽度: string | undefined = void 0
  private 选中的行: Set<number> = new Set()
  private 最后点击的单元格: { 行: number; 列: number } | null = null
  private 多选模式: boolean = false
  private 最后点击的行: number = -1
  private shift选择起点: number = -1
  private 表格行元素映射: Map<number, HTMLTableRowElement> = new Map()
  private 表格单元格元素映射: Map<string, HTMLTableCellElement> = new Map()
  private 表头元素映射: Map<number, HTMLElement> = new Map()
  private 列单元格映射: Map<number, HTMLElement[]> = new Map()
  private 分页组件: 分页组件 | null = null
  private 宿主样式: 增强样式类型 | undefined

  private 处理鼠标移动 = (event: MouseEvent): void => {
    if (this.是否正在拖动 === false) return
    let 差值 = event.clientX - this.拖动起始X
    let 新宽度 = Math.max(50, this.拖动起始宽度 + 差值)
    let 列索引 = this.拖动列索引
    let th = this.表头元素映射.get(列索引)
    let tds = this.列单元格映射.get(列索引) ?? []
    if (th !== void 0) {
      th.style.width = `${新宽度}px`
      if (差值 > 0) {
        th.style.maxWidth = `${新宽度}px`
      } else if (差值 < 0) {
        th.style.minWidth = `${新宽度}px`
      }
    }
    for (let td of tds) {
      td.style.width = `${新宽度}px`
      if (差值 > 0) {
        td.style.maxWidth = `${新宽度}px`
      } else if (差值 < 0) {
        td.style.minWidth = `${新宽度}px`
      }
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
    this.分页配置 = {
      当前页码: 1,
      每页数量: 选项.每页数量 ?? 10,
      总数量: 0,
    }
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

  private 处理行点击(行索引: number, ctrl键: boolean, shift键: boolean): void {
    if (ctrl键 === true) {
      if (this.选中的行.has(行索引) === true) {
        this.选中的行.delete(行索引)
      } else {
        this.选中的行.add(行索引)
      }
      this.shift选择起点 = -1
    } else if (shift键 === true) {
      if (this.shift选择起点 === -1) {
        this.shift选择起点 = this.最后点击的行
      }
      let 开始行 = Math.min(this.shift选择起点, 行索引)
      let 结束行 = Math.max(this.shift选择起点, 行索引)
      this.选中的行.clear()
      for (let i = 开始行; i <= 结束行; i++) {
        this.选中的行.add(i)
      }
    } else {
      this.选中的行.clear()
      this.选中的行.add(行索引)
      this.shift选择起点 = -1
    }
    this.最后点击的行 = 行索引
    this.多选模式 = this.选中的行.size > 1
  }

  private 处理单元格点击(行索引: number, 列索引: number, ctrl键: boolean, shift键: boolean): void {
    this.最后点击的单元格 = { 行: 行索引, 列: 列索引 }
    this.处理行点击(行索引, ctrl键, shift键)
  }

  private async 复制选中内容(): Promise<void> {
    let 内容 = ''
    if (this.选中的行.size === 1 && this.最后点击的单元格 !== null) {
      // 复制单个单元格
      let 行数据 = this.数据列表[this.最后点击的单元格.行]
      if (行数据 !== void 0) {
        let 列配置 = this.列配置[this.最后点击的单元格.列]
        if (列配置 !== void 0) {
          let 值 = 行数据?.[列配置.字段名]
          内容 = 值 === null || 值 === void 0 ? 'NULL' : String(值)
        }
      }
    } else if (this.选中的行.size > 0) {
      // 复制选中行
      let 行内容列表: string[] = []
      for (let 行索引 = 0; 行索引 < this.数据列表.length; 行索引++) {
        if (this.选中的行.has(行索引) === true) {
          let 行数据 = this.数据列表[行索引]
          if (行数据 !== void 0) {
            let 单元格内容列表: string[] = []
            for (let 列 of this.列配置) {
              let 值 = 行数据?.[列.字段名]
              单元格内容列表.push(值 === null || 值 === void 0 ? 'NULL' : String(值))
            }
            行内容列表.push(单元格内容列表.join('\t'))
          }
        }
      }
      内容 = 行内容列表.join('\n') + '\n'
    }
    if (内容 !== '') {
      try {
        await navigator.clipboard.writeText(内容)
      } catch (错误) {
        console.error('复制失败:', 错误)
      }
    }
  }

  private 更新选中状态(): void {
    // 使用 requestAnimationFrame 来确保在浏览器下一次重绘前更新
    requestAnimationFrame(() => {
      // 更新行的选中状态
      for (let [行索引, 行元素] of this.表格行元素映射) {
        if (this.选中的行.has(行索引) === true) {
          行元素.style.backgroundColor = 'var(--选中背景颜色)'
        } else {
          行元素.style.backgroundColor = ''
        }
      }

      // 更新单元格的强调状态
      for (let [键, 单元格元素] of this.表格单元格元素映射) {
        let 部分列表 = 键.split('-')
        let 行索引字符串 = 部分列表[0]
        let 列索引字符串 = 部分列表[1]
        let 行索引 = 行索引字符串 !== void 0 ? parseInt(行索引字符串) : -1
        let 列索引 = 列索引字符串 !== void 0 ? parseInt(列索引字符串) : -1

        if (
          this.最后点击的单元格 !== null &&
          this.最后点击的单元格.行 === 行索引 &&
          this.最后点击的单元格.列 === 列索引 &&
          this.多选模式 === false
        ) {
          单元格元素.style.backgroundColor = 'var(--强调背景颜色)'
          单元格元素.style.border = '2px solid var(--强调颜色)'
        } else {
          单元格元素.style.backgroundColor = ''
          单元格元素.style.border = '1px solid var(--边框颜色)'
        }
      }
    })
  }

  private 显示右键菜单(x: number, y: number): void {
    let 菜单管理器 = 右键菜单管理器.获得实例()
    菜单管理器.显示菜单(x, y, [
      {
        文本: '复制',
        回调: async (): Promise<void> => {
          await this.复制选中内容()
        },
      },
    ])
  }

  private async 加载数据(): Promise<void> {
    if (this.是否加载中) return

    try {
      this.是否加载中 = true

      // 隐藏右键菜单
      右键菜单管理器.获得实例().隐藏菜单()

      // 清除选择状态
      this.选中的行.clear()
      this.最后点击的单元格 = null
      this.多选模式 = false
      this.最后点击的行 = -1
      this.shift选择起点 = -1

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
        this.数据列表 = 数据
      } else if (this.分页配置.当前页码 > 总页数) {
        this.分页配置.当前页码 = 总页数
        // 重新加载数据以获取正确页的数据
        let { 数据: 新数据, 总数: 新总数 } = await this.加载数据回调({
          页码: this.分页配置.当前页码,
          每页数量: this.分页配置.每页数量,
          排序列表: this.排序列表,
          筛选条件: this.筛选条件,
        })
        this.数据列表 = 新数据
        this.分页配置.总数量 = 新总数
      } else {
        this.数据列表 = 数据
      }

      await this.渲染()
    } finally {
      this.是否加载中 = false
      if (this.分页组件 !== null) {
        this.分页组件.更新配置(this.分页配置, this.是否加载中)
      }
    }
  }

  private async 渲染(): Promise<void> {
    // 清除元素映射
    this.表格行元素映射.clear()
    this.表格单元格元素映射.clear()
    this.表头元素映射.clear()
    this.列单元格映射.clear()

    let 列配置 = this.列配置
    let 数据列表 = this.数据列表
    let 操作列表 = this.操作列表
    let 顶部操作列表 = this.顶部操作列表

    let 有可扩展列 = this.列配置.some((列) => 列.列最大宽度 === void 0 && this.列最大宽度 === void 0)

    // 计算操作列宽度
    let 操作列宽度列表: number[] = []
    for (let 操作 of 操作列表) {
      let 临时按钮 = new 普通按钮({
        文本: 操作.名称,
        宿主样式: {
          visibility: 'hidden',
          position: 'absolute',
          top: '-1000px',
        },
        元素样式: {
          padding: '4px 12px',
        },
      })
      document.body.appendChild(临时按钮)
      await new Promise((resolve) => setTimeout(resolve, 0))
      let 宽度 = 临时按钮.offsetWidth
      操作列宽度列表.push(宽度 + 16) // 额外 padding
      document.body.removeChild(临时按钮)
    }

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      },
    })

    // 渲染顶部操作区
    if (顶部操作列表.length > 0) {
      let 操作区 = 创建元素('div', {
        style: {
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        },
      })

      for (let 操作 of 顶部操作列表) {
        let 按钮 = new 普通按钮({
          文本: 操作.名称,
          点击处理函数: 操作.回调,
        })
        操作区.appendChild(按钮)
      }

      容器.appendChild(操作区)
    }

    // 渲染表格
    let 表格元素 = 创建元素('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid var(--边框颜色)',
        tableLayout: 有可扩展列 ? 'fixed' : 'auto',
        userSelect: 'none',
      },
    })

    // 渲染表头
    let 表头 = 创建元素('thead')
    let 表头行 = 创建元素('tr')

    for (let 列 of 列配置) {
      let 字段名 = String(列.字段名)
      let 列索引 = 列配置.indexOf(列)
      let 有筛选值 = this.筛选条件[字段名] !== void 0
      let 筛选值 = this.筛选条件[字段名] ?? ''
      let 列最大宽度 = 列.列最大宽度 ?? this.列最大宽度

      let th = 创建元素('th', {
        style: {
          border: '1px solid var(--边框颜色)',
          padding: '8px',
          textAlign: 'left',
          backgroundColor: 有筛选值 ? 'var(--color-accent)' : 'var(--color-background-secondary)',
          position: 'relative',
          userSelect: 'none',
          minWidth: 列.列最小宽度 ?? this.列最小宽度,
          ...(列最大宽度 !== void 0 ? { maxWidth: 列最大宽度, width: 列最大宽度 } : {}),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      })
      th.setAttribute('data-col-index', 列索引.toString())

      // 保存表头元素引用
      this.表头元素映射.set(列索引, th)

      // 创建表头内容容器
      let 表头内容 = 创建元素('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        },
      })

      let 标签文本 = 创建元素('span', {
        textContent: 列.显示名,
      })
      表头内容.appendChild(标签文本)

      // 如果有筛选值，显示筛选值
      if (有筛选值) {
        let 筛选值容器 = 创建元素('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          },
        })

        let 筛选值显示 = 创建元素('span', {
          textContent: `筛选: ${筛选值}`,
          style: {
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            fontWeight: 'bold',
          },
        })
        筛选值容器.appendChild(筛选值显示)

        // 清空筛选按钮
        let 清空按钮 = new 普通按钮({
          文本: '✕',
          元素样式: { fontSize: '12px', color: 'var(--color-text-secondary)' },
          点击处理函数: async (event: Event): Promise<void> => {
            event.stopPropagation()
            delete this.筛选条件[字段名]
            await this.加载数据()
          },
        })
        筛选值容器.appendChild(清空按钮)

        表头内容.appendChild(筛选值容器)
      }

      // 筛选图标
      if (列.可筛选 === true) {
        let 筛选图标 = new 普通按钮({
          文本: '🔍',
          点击处理函数: async (event: Event): Promise<void> => {
            event.stopPropagation()
            let 字段名 = String(列.字段名)
            let 当前筛选值 = this.筛选条件[字段名] ?? ''
            let 筛选值 = await 显示输入对话框('输入筛选条件:', 当前筛选值)
            if (筛选值 !== null) {
              if (筛选值 === '') {
                delete this.筛选条件[字段名]
              } else {
                this.筛选条件[字段名] = 筛选值
              }
              await this.加载数据()
            }
          },
        })
        表头内容.appendChild(筛选图标)
      }

      th.textContent = ''
      th.appendChild(表头内容)

      // 添加拖动句柄
      th.style.position = 'relative'
      let 拖动句柄 = 创建元素('div', {
        style: {
          position: 'absolute',
          right: '0',
          top: '0',
          bottom: '0',
          width: '5px',
          backgroundColor: 'transparent',
        },
        onmouseenter: (): void => {
          拖动句柄.style.cursor = 'ew-resize'
        },
        onmouseleave: (): void => {
          拖动句柄.style.cursor = 'pointer'
        },
        onmousedown: (event: MouseEvent): void => {
          this.是否正在拖动 = true
          this.拖动列索引 = 列配置.indexOf(列)
          this.拖动起始X = event.clientX
          this.拖动起始宽度 = th.offsetWidth
          document.onmousemove = this.处理鼠标移动
          document.onmouseup = this.处理鼠标释放
          event.preventDefault()
        },
      })
      th.appendChild(拖动句柄)

      if (列.可排序 === true) {
        let 执行排序 = async (): Promise<void> => {
          let 字段名 = 列.字段名
          let 现有索引 = this.排序列表.findIndex((项) => 项.field === 字段名)
          if (现有索引 !== -1) {
            let 当前项 = this.排序列表[现有索引]
            if (当前项 !== void 0 && 当前项.direction === 'asc') {
              当前项.direction = 'desc'
            } else if (当前项 !== void 0) {
              this.排序列表.splice(现有索引, 1)
            }
          } else {
            this.排序列表.push({ field: 字段名, direction: 'asc' })
          }
          await this.加载数据()
        }

        标签文本.style.cursor = 'pointer'
        标签文本.onclick = 执行排序

        // 添加hover效果
        let 添加悬停效果 = (): void => {
          标签文本.style.color = 'var(--主色调)'
        }
        let 移除悬停效果 = (): void => {
          标签文本.style.color = ''
        }
        标签文本.onmouseenter = 添加悬停效果
        标签文本.onmouseleave = 移除悬停效果

        // 添加排序指示器
        let 排序项 = this.排序列表.find((项) => 项.field === 列.字段名)
        let 指示器 = ''
        let 排序索引 = this.排序列表.findIndex((项) => 项.field === 列.字段名)
        if (排序项 !== void 0) {
          switch (排序项.direction) {
            case 'asc':
              指示器 = ` ▲${排序索引}`
              break
            case 'desc':
              指示器 = ` ▼${排序索引}`
              break
            default:
              let _类型检查: never = 排序项.direction
          }
        }
        标签文本.textContent = 列.显示名 + 指示器
      }

      表头行.appendChild(th)
    }

    // 添加操作列表头
    for (let i = 0; i < 操作列表.length; i++) {
      let 操作 = 操作列表[i]
      if (操作 === void 0) throw new Error('意外的数组越界')
      let 操作th = 创建元素('th', {
        textContent: 操作.名称,
        style: {
          border: '1px solid var(--边框颜色)',
          padding: '8px',
          textAlign: 'center',
          backgroundColor: 'var(--color-background-secondary)',
          width: `${操作列宽度列表[i]}px`,
        },
      })
      表头行.appendChild(操作th)
    }

    表头.appendChild(表头行)
    表格元素.appendChild(表头)

    // 渲染表体
    let 表体 = 创建元素('tbody')

    if (数据列表.length === 0) {
      let 空行 = 创建元素('tr')
      let 列数 = 列配置.length + 操作列表.length
      let 空单元格 = 创建元素('td', {
        colSpan: 列数,
        textContent: '无数据',
        style: {
          textAlign: 'center',
          padding: '20px',
          border: '1px solid var(--边框颜色)',
          color: 'var(--color-text-secondary)',
        },
      })
      空行.appendChild(空单元格)
      表体.appendChild(空行)
    } else {
      for (let 行索引 = 0; 行索引 < 数据列表.length; 行索引++) {
        let 数据项 = 数据列表[行索引]
        if (数据项 === void 0) continue
        let 行选中 = this.选中的行.has(行索引)
        let 行 = 创建元素('tr', {
          style: {
            transition: 'background-color 0.2s',
            backgroundColor: 行选中 === true ? 'var(--选中背景颜色)' : '',
            cursor: 'pointer',
          },
          onmouseenter: (): void => {
            // 动态判断当前是否选中
            if (this.选中的行.has(行索引) === false) {
              行.style.backgroundColor = 'var(--color-background-hover)'
            }
          },
          onmouseleave: (): void => {
            // 动态判断当前是否选中
            行.style.backgroundColor = this.选中的行.has(行索引) === true ? 'var(--选中背景颜色)' : ''
          },
          onclick: (事件: MouseEvent): void => {
            事件.stopPropagation()
            this.处理行点击(行索引, 事件.ctrlKey, 事件.shiftKey)
            this.更新选中状态()
          },
          oncontextmenu: (事件: MouseEvent): void => {
            事件.preventDefault()
            事件.stopPropagation()
            // 右键时如果当前行未选中，则选中当前行
            if (this.选中的行.has(行索引) === false) {
              this.处理行点击(行索引, false, false)
              this.更新选中状态()
            }
            this.显示右键菜单(事件.clientX, 事件.clientY)
          },
        })

        // 保存行元素引用
        this.表格行元素映射.set(行索引, 行)

        // 渲染数据列
        for (let 列索引 = 0; 列索引 < 列配置.length; 列索引++) {
          let 列 = 列配置[列索引]
          if (列 === void 0) continue
          let 数据 = 数据项?.[列.字段名]
          let 显示值 = 列.格式化 !== void 0 ? 列.格式化(数据) : String(数据)
          let 列最大宽度 = 列.列最大宽度 ?? this.列最大宽度
          let 单元格被强调 =
            this.最后点击的单元格 !== null &&
            this.最后点击的单元格.行 === 行索引 &&
            this.最后点击的单元格.列 === 列索引 &&
            this.多选模式 === false

          let td = 创建元素('td', {
            textContent: 显示值,
            title: 显示值,
            style: {
              padding: '8px',
              border: 单元格被强调 === true ? '2px solid var(--强调颜色)' : '1px solid var(--边框颜色)',
              backgroundColor: 单元格被强调 === true ? 'var(--强调背景颜色)' : '',
              minWidth: 列.列最小宽度 ?? this.列最小宽度,
              ...(列最大宽度 !== void 0 ? { maxWidth: 列最大宽度, width: 列最大宽度 } : {}),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            },
            onclick: (事件: MouseEvent): void => {
              事件.stopPropagation()
              this.处理单元格点击(行索引, 列索引, 事件.ctrlKey, 事件.shiftKey)
              this.更新选中状态()
            },
            oncontextmenu: (事件: MouseEvent): void => {
              事件.preventDefault()
              事件.stopPropagation()
              // 右键时如果当前行未选中或不是单选，则选中当前单元格
              if (
                this.选中的行.has(行索引) === false ||
                (this.选中的行.size === 1 &&
                  (this.最后点击的单元格 === null ||
                    this.最后点击的单元格.行 !== 行索引 ||
                    this.最后点击的单元格.列 !== 列索引))
              ) {
                this.处理单元格点击(行索引, 列索引, false, false)
                this.更新选中状态()
              }
              this.显示右键菜单(事件.clientX, 事件.clientY)
            },
          })
          td.setAttribute('data-col-index', 列索引.toString())

          // 保存单元格元素引用
          this.表格单元格元素映射.set(`${行索引}-${列索引}`, td)

          // 保存到列单元格映射
          let 列单元格列表 = this.列单元格映射.get(列索引) ?? []
          列单元格列表.push(td)
          this.列单元格映射.set(列索引, 列单元格列表)

          行.appendChild(td)
        }

        // 渲染操作列
        for (let i = 0; i < 操作列表.length; i++) {
          let 操作 = 操作列表[i]
          if (操作 === void 0) throw new Error('意外的数组越界')
          let 操作单元格 = 创建元素('td', {
            style: {
              padding: '8px',
              border: '1px solid var(--边框颜色)',
              textAlign: 'center',
              width: `${操作列宽度列表[i]}px`,
            },
          })

          let 按钮 = new 普通按钮({
            文本: 操作.名称,
            点击处理函数: async (): Promise<void> => {
              await 操作.回调(数据项)
              await this.刷新数据()
            },
          })
          操作单元格.appendChild(按钮)

          行.appendChild(操作单元格)
        }

        表体.appendChild(行)
      }
    }

    表格元素.appendChild(表体)

    容器.appendChild(表格元素)

    // 渲染分页
    if (this.分页组件 === null) {
      this.分页组件 = new 分页组件(this.分页配置, this.是否加载中)
      this.分页组件.监听发出事件('页码变化', async (event) => {
        this.分页配置.当前页码 = event.detail.页码
        await this.加载数据()
      })
    } else {
      this.分页组件.更新配置(this.分页配置, this.是否加载中)
    }
    容器.appendChild(this.分页组件)

    this.shadow.innerHTML = ''
    this.shadow.appendChild(容器)
  }

  protected override async 当加载时(): Promise<void> {
    if (this.宿主样式 !== void 0) {
      for (let [键, 值] of Object.entries(this.宿主样式)) {
        if (typeof 值 === 'string') {
          this.style.setProperty(键, 值)
        }
      }
    }
    await this.加载数据()
  }
}
