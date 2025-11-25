import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'

type 属性类型 = {}

type 发出事件类型 = {
  操作点击: { 操作名: string; 数据项: any }
}

type 监听事件类型 = {}

export type 列配置<数据项> = {
  字段名: keyof 数据项
  显示名: string
  格式化?: (值: any) => string
  可排序?: boolean
}

export type 操作配置 = {
  名称: string
  回调: (数据项: any) => Promise<void>
}

export type 表格数据<数据项> = {
  列配置: 列配置<数据项>[]
  数据列表: 数据项[]
  操作列表?: 操作配置[]
}

export class LsbyTableView extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-table-view', this)
  }

  private 表格数据: 表格数据<any> | null = null
  private 当前排序字段: string | null = null
  private 当前排序方向: 'asc' | 'desc' | null = null
  private 排序变化回调: ((排序字段: string | null, 排序方向: 'asc' | 'desc' | null) => Promise<void>) | null = null

  public 设置数据<数据项>(数据: 表格数据<数据项>): void {
    this.表格数据 = 数据
    this.渲染表格().catch(console.error)
  }

  public 设置排序变化回调(回调: (排序字段: string | null, 排序方向: 'asc' | 'desc' | null) => Promise<void>): void {
    this.排序变化回调 = 回调
  }

  private async 渲染表格(): Promise<void> {
    if (this.表格数据 === null) return

    let { 列配置, 数据列表, 操作列表 = [] } = this.表格数据

    let 表格元素 = 创建元素('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid var(--边框颜色)',
        tableLayout: 'fixed',
      },
    })

    // 渲染表头
    let 表头 = 创建元素('thead')
    let 表头行 = 创建元素('tr')

    for (let 列 of 列配置) {
      let th = 创建元素('th', {
        textContent: 列.显示名,
        style: {
          border: '1px solid var(--边框颜色)',
          padding: '8px',
          textAlign: 'left',
          backgroundColor: 'var(--color-background-secondary)',
        },
      })

      if (列.可排序 === true) {
        th.style.cursor = 'pointer'
        th.onclick = async (): Promise<void> => {
          let 字段名 = String(列.字段名)
          if (this.当前排序字段 !== 字段名) {
            this.当前排序字段 = 字段名
            this.当前排序方向 = 'asc'
          } else if (this.当前排序方向 === 'asc') {
            this.当前排序方向 = 'desc'
          } else if (this.当前排序方向 === 'desc') {
            this.当前排序字段 = null
            this.当前排序方向 = null
          } else {
            this.当前排序方向 = 'asc'
          }
          if (this.排序变化回调 !== null) {
            await this.排序变化回调(this.当前排序字段, this.当前排序方向)
          }
          await this.渲染表格()
        }

        // 添加排序指示器
        let 指示器 = ''
        if (this.当前排序字段 === String(列.字段名)) {
          if (this.当前排序方向 === 'asc') {
            指示器 = ' ↑'
          } else if (this.当前排序方向 === 'desc') {
            指示器 = ' ↓'
          }
        }
        th.textContent = 列.显示名 + 指示器
      }

      表头行.appendChild(th)
    }

    // 添加操作列表头
    if (操作列表.length > 0) {
      for (let 操作 of 操作列表) {
        let 操作th = 创建元素('th', {
          textContent: 操作.名称,
          style: {
            border: '1px solid var(--边框颜色)',
            padding: '8px',
            textAlign: 'center',
            backgroundColor: 'var(--color-background-secondary)',
            width: '100px',
          },
        })
        表头行.appendChild(操作th)
      }
    }

    表头.appendChild(表头行)
    表格元素.appendChild(表头)

    // 渲染表体
    let 表体 = 创建元素('tbody')

    if (数据列表.length === 0) {
      let 空行 = 创建元素('tr')
      let 空单元格 = 创建元素('td', {
        colSpan: 列配置.length + 操作列表.length,
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let 数据 = 数据项[列.字段名]
          let 显示值 = 列.格式化 !== void 0 ? 列.格式化(数据) : String(数据)
          let td = 创建元素('td', {
            textContent: 显示值,
            title: 显示值,
            style: {
              padding: '8px',
              border: '1px solid var(--边框颜色)',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            },
          })
          行.appendChild(td)
        }

        // 渲染操作列
        for (let 操作 of 操作列表) {
          let 单元格 = 创建元素('td', {
            style: {
              padding: '8px',
              border: '1px solid var(--边框颜色)',
              textAlign: 'center',
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
            },
          })

          单元格.appendChild(按钮)
          行.appendChild(单元格)
        }

        表体.appendChild(行)
      }
    }

    表格元素.appendChild(表体)

    this.shadow.innerHTML = ''
    this.shadow.appendChild(表格元素)
  }

  protected override async 当加载时(): Promise<void> {
    await this.渲染表格()
  }
}
