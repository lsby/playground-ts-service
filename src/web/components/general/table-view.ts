import { 组件基类 } from '../../base/base'

type 属性类型 = {}

type 发出事件类型 = {
  操作点击: { 操作名: string; 数据项: any }
}

type 监听事件类型 = {}

export type 列配置<数据项> = {
  字段名: keyof 数据项
  显示名: string
  格式化?: (值: any) => string
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

  public 设置数据<数据项>(数据: 表格数据<数据项>): void {
    this.表格数据 = 数据
    this.渲染表格().catch(console.error)
  }

  private async 渲染表格(): Promise<void> {
    if (this.表格数据 === null) return

    let { 列配置, 数据列表, 操作列表 = [] } = this.表格数据

    let 表格元素 = document.createElement('table')
    表格元素.style.width = '100%'
    表格元素.style.borderCollapse = 'collapse'
    表格元素.style.border = '1px solid var(--边框颜色)'
    表格元素.style.tableLayout = 'fixed'

    // 渲染表头
    let 表头 = document.createElement('thead')
    let 表头行 = document.createElement('tr')

    for (let 列 of 列配置) {
      let th = document.createElement('th')
      th.textContent = 列.显示名
      th.style.border = '1px solid var(--边框颜色)'
      th.style.padding = '8px'
      th.style.textAlign = 'left'
      th.style.backgroundColor = 'var(--color-background-secondary)'
      表头行.appendChild(th)
    }

    // 添加操作列表头
    if (操作列表.length > 0) {
      for (let 操作 of 操作列表) {
        let 操作th = document.createElement('th')
        操作th.textContent = 操作.名称
        操作th.style.border = '1px solid var(--边框颜色)'
        操作th.style.padding = '8px'
        操作th.style.textAlign = 'center'
        操作th.style.backgroundColor = 'var(--color-background-secondary)'
        操作th.style.width = '100px'
        表头行.appendChild(操作th)
      }
    }

    表头.appendChild(表头行)
    表格元素.appendChild(表头)

    // 渲染表体
    let 表体 = document.createElement('tbody')

    if (数据列表.length === 0) {
      let 空行 = document.createElement('tr')
      let 空单元格 = document.createElement('td')
      空单元格.colSpan = 列配置.length + 操作列表.length
      空单元格.textContent = '无数据'
      空单元格.style.textAlign = 'center'
      空单元格.style.padding = '20px'
      空单元格.style.border = '1px solid var(--边框颜色)'
      空单元格.style.color = 'var(--color-text-secondary)'
      空行.appendChild(空单元格)
      表体.appendChild(空行)
    } else {
      for (let 数据项 of 数据列表) {
        let 行 = document.createElement('tr')
        行.style.transition = 'background-color 0.2s'
        行.onmouseenter = (): void => {
          行.style.backgroundColor = 'var(--color-background-hover)'
        }
        行.onmouseleave = (): void => {
          行.style.backgroundColor = ''
        }

        // 渲染数据列
        for (let 列 of 列配置) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let 数据 = 数据项[列.字段名]
          let td = document.createElement('td')

          let 显示值 = 列.格式化 !== void 0 ? 列.格式化(数据) : String(数据)
          td.textContent = 显示值
          td.title = 显示值
          td.style.padding = '8px'
          td.style.border = '1px solid var(--边框颜色)'
          td.style.textOverflow = 'ellipsis'
          td.style.whiteSpace = 'nowrap'
          td.style.overflow = 'hidden'
          行.appendChild(td)
        }

        // 渲染操作列
        for (let 操作 of 操作列表) {
          let 单元格 = document.createElement('td')
          单元格.style.padding = '8px'
          单元格.style.border = '1px solid var(--边框颜色)'
          单元格.style.textAlign = 'center'

          let 按钮 = document.createElement('button')
          按钮.textContent = 操作.名称
          按钮.style.padding = '4px 12px'
          按钮.style.cursor = 'pointer'
          按钮.onclick = async (): Promise<void> => {
            await 操作.回调(数据项)
          }

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
