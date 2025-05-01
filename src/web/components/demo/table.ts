import { API组件基类 } from '../../base/base-api'
import { 通过路径获得接口定义 } from '../../global/types'

type 接口定义 = [通过路径获得接口定义<'/api/base/get-list'>]
type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 表格组件 extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-table', this)
  }

  private 字段配置 = [
    { 字段名: 'id' as const, 显示名: '编号' },
    { 字段名: 'value' as const, 显示名: '数值' },
  ]

  private async 添加数据(): Promise<void> {
    let data = prompt('请输入要添加的数据:')
    if (data === '' || data === null) return
    console.log('假装添加数据')
  }
  private async 删除数据(id: string): Promise<void> {
    console.log('假装删除: %o', id)
  }

  private async 加载数据(当前页码: number, 每页数量: number): Promise<void> {
    let { data: 数据列表, total: 数据总数 } = await this.请求接口并处理错误('/api/base/get-list', {
      page: 当前页码,
      size: 每页数量,
    })

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

    for (let 字段 of this.字段配置) {
      let th = document.createElement('th')
      th.textContent = 字段.显示名
      th.style.border = '1px solid #ccc'
      th.style.padding = '8px'
      th.style.textAlign = 'left'
      表头行.appendChild(th)
    }

    // 删除列头 开始
    let 操作th = document.createElement('th')
    操作th.textContent = '操作'
    操作th.style.border = '1px solid #ccc'
    操作th.style.padding = '8px'
    操作th.style.textAlign = 'left'
    表头行.appendChild(操作th)
    // 删除列头 结束

    表头.appendChild(表头行)
    表格元素.appendChild(表头)

    let 表体 = document.createElement('tbody')
    for (let 数据项 of 数据列表) {
      let 行 = document.createElement('tr')

      for (let 字段 of this.字段配置) {
        let td = document.createElement('td')
        td.textContent = 数据项[字段.字段名].toString()
        td.style.padding = '8px'
        td.style.border = '1px solid #ccc'
        行.appendChild(td)
      }

      // 删除列 开始
      let 删除单元格 = document.createElement('td')
      删除单元格.style.padding = '8px'
      删除单元格.style.border = '1px solid #ccc'

      let 删除按钮 = document.createElement('button')
      删除按钮.textContent = '删除'
      删除按钮.onclick = async (): Promise<void> => {
        if (confirm('你确定要删除这条数据吗？')) {
          await this.删除数据(数据项.id)
          await this.加载数据(当前页码, 每页数量)
        }
      }
      // 删除列 结束

      删除单元格.appendChild(删除按钮)
      行.appendChild(删除单元格)

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
    下一页按钮.disabled = 当前页码 >= Math.ceil(数据总数 / 每页数量)
    下一页按钮.onclick = async (): Promise<void> => {
      if (当前页码 < Math.ceil(数据总数 / 每页数量)) {
        当前页码++
        await this.加载数据(当前页码, 每页数量)
      }
    }
    分页区域.appendChild(下一页按钮)

    let 添加按钮 = document.createElement('button')
    添加按钮.textContent = '添加数据'
    添加按钮.onclick = async (): Promise<void> => {
      await this.添加数据()
      await this.加载数据(当前页码, 每页数量)
    }
    分页区域.appendChild(添加按钮)

    this.shadow.innerHTML = ''
    容器元素.appendChild(分页区域)
    this.shadow.appendChild(容器元素)
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let 当前页码 = 1
    let 每页数量 = 5

    await this.加载数据(当前页码, 每页数量)
  }
}
