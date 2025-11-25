import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'

export type 数据表列配置<数据项> = {
  字段名: keyof 数据项
  显示名: string
  格式化?: (值: any) => string
  可排序?: boolean
  列最小宽度?: string
  列最大宽度?: string
}

export type 数据表操作配置<数据项> = {
  名称: string
  回调: (数据项: 数据项) => Promise<void>
}

export type 数据表分页配置 = {
  当前页码: number
  每页数量: number
  总数量: number
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
  每页数量?: number
  列最小宽度?: string
  列最大宽度?: string
  加载数据: (参数: 数据表加载数据参数<数据项>) => Promise<{ 数据: 数据项[]; 总数: number }>
}

type 属性类型 = {}

type 发出事件类型<数据项> = {
  操作点击: { 操作名: string; 数据项: 数据项 }
  页码变化: { 页码: number }
}

type 监听事件类型 = {}

export class LsbyDataTable<数据项> extends 组件基类<属性类型, 发出事件类型<数据项>, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-data-table', this)
  }

  private 列配置: 数据表列配置<数据项>[]
  private 操作列表: 数据表操作配置<数据项>[]
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

  private 处理鼠标移动 = (event: MouseEvent): void => {
    if (this.是否正在拖动 === false) return
    let 差值 = event.clientX - this.拖动起始X
    let 新宽度 = Math.max(50, this.拖动起始宽度 + 差值)
    let 列索引 = this.拖动列索引
    let ths = this.shadow.querySelectorAll(`th[data-col-index="${列索引}"]`)
    let tds = this.shadow.querySelectorAll(`tbody td[data-col-index="${列索引}"]`)
    for (let th of ths) {
      let 元素 = th as HTMLElement
      元素.style.width = `${新宽度}px`
      if (差值 > 0) {
        元素.style.maxWidth = `${新宽度}px`
      } else if (差值 < 0) {
        元素.style.minWidth = `${新宽度}px`
      }
    }
    for (let td of tds) {
      let 元素 = td as HTMLElement
      元素.style.width = `${新宽度}px`
      if (差值 > 0) {
        元素.style.maxWidth = `${新宽度}px`
      } else if (差值 < 0) {
        元素.style.minWidth = `${新宽度}px`
      }
    }
  }

  private 处理鼠标释放 = (): void => {
    this.是否正在拖动 = false
    this.拖动列索引 = -1
    document.removeEventListener('mousemove', this.处理鼠标移动)
    document.removeEventListener('mouseup', this.处理鼠标释放)
  }

  public constructor(选项: 数据表格选项<数据项>) {
    super()
    this.列配置 = 选项.列配置
    this.操作列表 = 选项.操作列表 ?? []
    this.加载数据回调 = 选项.加载数据
    this.列最小宽度 = 选项.列最小宽度 ?? '50px'
    this.列最大宽度 = 选项.列最大宽度
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
    this.分页配置.当前页码 = 1
    await this.加载数据()
  }

  private async 加载数据(): Promise<void> {
    if (this.是否加载中) return

    try {
      this.是否加载中 = true

      let { 数据, 总数 } = await this.加载数据回调({
        页码: this.分页配置.当前页码,
        每页数量: this.分页配置.每页数量,
        排序列表: this.排序列表,
        筛选条件: this.筛选条件,
      })

      this.数据列表 = 数据
      this.分页配置.总数量 = 总数

      await this.渲染()
    } finally {
      this.是否加载中 = false
    }
  }

  private async 渲染(): Promise<void> {
    let 列配置 = this.列配置
    let 数据列表 = this.数据列表
    let 操作列表 = this.操作列表

    let 有可扩展列 = this.列配置.some((列) => 列.列最大宽度 === void 0 && this.列最大宽度 === void 0)

    // 计算操作列宽度
    let 操作列宽度列表: number[] = []
    for (let 操作 of 操作列表) {
      let 临时按钮 = 创建元素('button', {
        textContent: 操作.名称,
        style: {
          padding: '4px 12px',
          visibility: 'hidden',
          position: 'absolute',
          top: '-1000px',
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

    // 渲染表格
    let 表格元素 = 创建元素('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid var(--边框颜色)',
        tableLayout: 有可扩展列 ? 'fixed' : 'auto',
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
        let 清空按钮 = 创建元素('button', {
          textContent: '✕',
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            opacity: '0.7',
            transition: 'opacity 0.2s',
          },
          onmouseenter: (): void => {
            清空按钮.style.opacity = '1'
          },
          onmouseleave: (): void => {
            清空按钮.style.opacity = '0.7'
          },
          onclick: async (event: Event): Promise<void> => {
            event.stopPropagation()
            delete this.筛选条件[字段名]
            this.分页配置.当前页码 = 1
            await this.加载数据()
          },
        })
        筛选值容器.appendChild(清空按钮)

        表头内容.appendChild(筛选值容器)
      }

      // 筛选图标
      let 筛选图标 = 创建元素('button', {
        textContent: '🔍',
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          fontSize: '16px',
          opacity: '0.5',
          transition: 'opacity 0.2s',
        },
        onmouseenter: (): void => {
          筛选图标.style.opacity = '1'
        },
        onmouseleave: (): void => {
          筛选图标.style.opacity = '0.5'
        },
        onclick: async (event: Event): Promise<void> => {
          event.stopPropagation()
          let { 显示输入对话框 } = await import('../../global/dialog')
          let 字段名 = String(列.字段名)
          let 当前筛选值 = this.筛选条件[字段名] ?? ''
          let 筛选值 = await 显示输入对话框('输入筛选条件:', 当前筛选值)
          if (筛选值 !== null) {
            if (筛选值 === '') {
              delete this.筛选条件[字段名]
            } else {
              this.筛选条件[字段名] = 筛选值
            }
            this.分页配置.当前页码 = 1
            await this.加载数据()
          }
        },
      })
      表头内容.appendChild(筛选图标)

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
          document.addEventListener('mousemove', this.处理鼠标移动)
          document.addEventListener('mouseup', this.处理鼠标释放)
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
          this.分页配置.当前页码 = 1
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
      for (let 数据项 of 数据列表) {
        let 行 = 创建元素('tr', {
          style: {
            transition: 'background-color 0.2s',
          },
          onmouseenter: (): void => {
            行.style.backgroundColor = 'var(--color-background-hover)'
          },
          onmouseleave: (): void => {
            行.style.backgroundColor = ''
          },
        })

        // 渲染数据列
        for (let 列 of 列配置) {
          let 列索引 = 列配置.indexOf(列)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let 数据 = 数据项[列.字段名]
          let 显示值 = 列.格式化 !== void 0 ? 列.格式化(数据) : String(数据)
          let 列最大宽度 = 列.列最大宽度 ?? this.列最大宽度

          let td = 创建元素('td', {
            textContent: 显示值,
            title: 显示值,
            style: {
              padding: '8px',
              border: '1px solid var(--边框颜色)',
              minWidth: 列.列最小宽度 ?? this.列最小宽度,
              ...(列最大宽度 !== void 0 ? { maxWidth: 列最大宽度, width: 列最大宽度 } : {}),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          })
          td.setAttribute('data-col-index', 列索引.toString())
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

          let 按钮 = 创建元素('button', {
            textContent: 操作.名称,
            style: {
              padding: '4px 12px',
              cursor: 'pointer',
            },
            onclick: async (): Promise<void> => {
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
    let { 当前页码, 每页数量, 总数量 } = this.分页配置
    let 总页数 = Math.ceil(总数量 / 每页数量)

    let 分页容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 0',
      },
    })

    // 上一页按钮
    let 上一页按钮 = 创建元素('button', {
      textContent: '上一页',
      disabled: 当前页码 <= 1 || this.是否加载中,
      style: {
        padding: '6px 16px',
        cursor: 当前页码 <= 1 || this.是否加载中 ? 'not-allowed' : 'pointer',
      },
      onclick: async (): Promise<void> => {
        if (当前页码 > 1) {
          this.分页配置.当前页码 = 当前页码 - 1
          await this.加载数据()
        }
      },
    })
    分页容器.appendChild(上一页按钮)

    // 页码显示
    let 页码显示 = 创建元素('span', {
      textContent: `第 ${当前页码} 页 / 共 ${总页数} 页 (总共 ${总数量} 条)`,
      style: {
        margin: '0 8px',
        color: 'var(--color-text-secondary)',
      },
    })
    分页容器.appendChild(页码显示)

    // 下一页按钮
    let 下一页按钮 = 创建元素('button', {
      textContent: '下一页',
      disabled: 当前页码 >= 总页数 || this.是否加载中,
      style: {
        padding: '6px 16px',
        cursor: 当前页码 >= 总页数 || this.是否加载中 ? 'not-allowed' : 'pointer',
      },
      onclick: async (): Promise<void> => {
        if (当前页码 < 总页数) {
          this.分页配置.当前页码 = 当前页码 + 1
          await this.加载数据()
        }
      },
    })
    分页容器.appendChild(下一页按钮)

    容器.appendChild(分页容器)

    this.shadow.innerHTML = ''
    this.shadow.appendChild(容器)
  }

  protected override async 当加载时(): Promise<void> {
    await this.加载数据()
  }
}
