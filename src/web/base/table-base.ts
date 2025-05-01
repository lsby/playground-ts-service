import { API组件基类, 接口定义形状 } from './base-api'

export type 自定义操作 = Record<string, () => Promise<void>>
export type 自定义项操作<数据项> = Record<string, (数据: 数据项) => Promise<void>>

export abstract class 表格组件基类<
  接口定义 extends 接口定义形状,
  属性类型 extends Record<string, string>,
  发出事件类型 extends Record<string, any>,
  监听事件类型 extends Record<string, any>,
  数据项 extends { [key: string]: string | number | boolean },
> extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  protected abstract 映射显示字段名称(数据字段: keyof 数据项): string
  protected abstract 请求数据(当前页码: number, 每页数量: number): Promise<{ data: 数据项[]; total: number }>
  protected abstract 获得自定义操作(): Promise<自定义操作>
  protected abstract 获得自定义项操作(): Promise<自定义项操作<数据项>>

  protected async 加载数据(当前页码: number, 每页数量: number): Promise<void> {
    let { data, total } = await this.请求数据(当前页码, 每页数量)
    let 第一条数据 = data[0]
    let 原始列名 = 第一条数据 === void 0 ? [] : Object.keys(第一条数据)

    let 容器元素 = document.createElement('div')
    容器元素.style.display = 'flex'
    容器元素.style.flexDirection = 'column'
    容器元素.style.boxSizing = 'border-box'
    容器元素.style.padding = '16px'

    let 内容区域 = document.createElement('div')
    内容区域.style.flex = '1'
    内容区域.style.overflow = 'auto'

    let 表格元素 = document.createElement('table')
    表格元素.style.width = '100%'
    表格元素.style.borderCollapse = 'collapse'
    表格元素.style.border = '1px solid #ccc'

    let 表头 = document.createElement('thead')
    let 表头行 = document.createElement('tr')

    for (let 字段 of 原始列名) {
      let th = document.createElement('th')
      th.textContent = this.映射显示字段名称(字段)
      th.style.border = '1px solid #ccc'
      th.style.padding = '8px'
      th.style.textAlign = 'left'
      表头行.appendChild(th)
    }

    let 自定义项操作们 = await this.获得自定义项操作()
    for (let 自定义项操作 of Object.entries(自定义项操作们)) {
      let 操作th = document.createElement('th')
      操作th.textContent = 自定义项操作[0]
      操作th.style.border = '1px solid #ccc'
      操作th.style.padding = '8px'
      操作th.style.textAlign = 'left'
      表头行.appendChild(操作th)
    }

    表头.appendChild(表头行)
    表格元素.appendChild(表头)

    let 表体 = document.createElement('tbody')
    for (let 数据项 of data) {
      let 行 = document.createElement('tr')

      for (let 字段 of 原始列名) {
        let 数据 = 数据项[字段]
        if (数据 === void 0) throw new Error(`无法访问数据项中的字段: ${String(字段)}`)
        let td = document.createElement('td')
        td.textContent = 数据.toString()
        td.style.padding = '8px'
        td.style.border = '1px solid #ccc'
        行.appendChild(td)
      }

      let 自定义项操作们 = await this.获得自定义项操作()
      for (let 自定义项操作 of Object.entries(自定义项操作们)) {
        let 单元格 = document.createElement('td')
        单元格.style.padding = '8px'
        单元格.style.border = '1px solid #ccc'

        let 按钮 = document.createElement('button')
        按钮.textContent = 自定义项操作[0]
        按钮.onclick = async (): Promise<void> => {
          await 自定义项操作[1](数据项)
          await this.加载数据(当前页码, 每页数量)
        }

        单元格.appendChild(按钮)
        行.appendChild(单元格)
      }

      表体.appendChild(行)
    }

    表格元素.appendChild(表体)
    内容区域.appendChild(表格元素)
    容器元素.appendChild(内容区域)

    let 分页区域 = document.createElement('div')
    分页区域.style.display = 'flex'
    分页区域.style.justifyContent = 'center'
    分页区域.style.alignItems = 'center'
    分页区域.style.gap = '16px'
    分页区域.style.padding = '12px 0'

    let 上一页按钮 = document.createElement('button')
    上一页按钮.textContent = '上一页'
    上一页按钮.disabled = 当前页码 <= 1
    上一页按钮.onclick = async (): Promise<void> => {
      if (当前页码 > 1) {
        当前页码--
        await this.加载数据(当前页码, 每页数量)
      }
    }
    分页区域.appendChild(上一页按钮)

    let 下一页按钮 = document.createElement('button')
    下一页按钮.textContent = '下一页'
    下一页按钮.disabled = 当前页码 >= Math.ceil(total / 每页数量)
    下一页按钮.onclick = async (): Promise<void> => {
      if (当前页码 < Math.ceil(total / 每页数量)) {
        当前页码++
        await this.加载数据(当前页码, 每页数量)
      }
    }
    分页区域.appendChild(下一页按钮)

    let 自定义操作们 = await this.获得自定义操作()
    for (let 自定义操作 of Object.entries(自定义操作们)) {
      let 按钮 = document.createElement('button')
      按钮.textContent = 自定义操作[0]
      按钮.onclick = async (): Promise<void> => {
        await 自定义操作[1]()
        await this.加载数据(当前页码, 每页数量)
      }
      分页区域.appendChild(按钮)
    }

    this.shadow.innerHTML = ''
    容器元素.appendChild(分页区域)
    this.shadow.appendChild(容器元素)
  }
}
