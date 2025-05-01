import { API组件基类 } from '../../base/base-api'
import { 通过路径获得接口定义 } from '../../global/types'

type 接口定义 = [通过路径获得接口定义<'/api/base/get-list'>]
type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyTable extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-table', this)
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let page = 1
    let size = 5

    let 加载数据 = async (): Promise<void> => {
      let { data, total } = await this.请求接口并处理错误('/api/base/get-list', { page, size })

      let container = document.createElement('div')
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.boxSizing = 'border-box'
      container.style.padding = '16px'

      let content = document.createElement('div')
      content.style.flex = '1'
      content.style.overflow = 'auto'

      // 表格
      let table = document.createElement('table')
      table.style.width = '100%'
      table.style.borderCollapse = 'collapse'
      table.style.border = '1px solid #ccc'

      let thead = document.createElement('thead')
      let headerRow = document.createElement('tr')

      let thId = document.createElement('th')
      thId.textContent = 'ID'
      thId.style.border = '1px solid #ccc'
      thId.style.padding = '8px'
      thId.style.textAlign = 'left'

      let thValue = document.createElement('th')
      thValue.textContent = 'Value'
      thValue.style.border = '1px solid #ccc'
      thValue.style.padding = '8px'
      thValue.style.textAlign = 'left'

      headerRow.appendChild(thId)
      headerRow.appendChild(thValue)
      thead.appendChild(headerRow)
      table.appendChild(thead)

      let tbody = document.createElement('tbody')
      for (let item of data) {
        let row = document.createElement('tr')

        let tdId = document.createElement('td')
        tdId.textContent = `${item.id}`
        tdId.style.padding = '8px'
        tdId.style.border = '1px solid #ccc'

        let tdValue = document.createElement('td')
        tdValue.textContent = `${item.value}`
        tdValue.style.padding = '8px'
        tdValue.style.border = '1px solid #ccc'

        row.appendChild(tdId)
        row.appendChild(tdValue)
        tbody.appendChild(row)
      }
      table.appendChild(tbody)
      content.appendChild(table)
      container.appendChild(content)

      // 分页按钮
      let footer = document.createElement('div')
      footer.style.display = 'flex'
      footer.style.justifyContent = 'center'
      footer.style.alignItems = 'center'
      footer.style.gap = '16px'
      footer.style.padding = '12px 0'

      let prevBtn = document.createElement('button')
      prevBtn.textContent = '上一页'
      prevBtn.disabled = page <= 1
      prevBtn.onclick = async (): Promise<void> => {
        if (page > 1) {
          page--
          await 加载数据()
        }
      }

      let nextBtn = document.createElement('button')
      nextBtn.textContent = '下一页'
      nextBtn.disabled = page >= Math.ceil(total / size)
      nextBtn.onclick = async (): Promise<void> => {
        if (page < Math.ceil(total / size)) {
          page++
          await 加载数据()
        }
      }

      footer.appendChild(prevBtn)
      footer.appendChild(nextBtn)
      container.appendChild(footer)

      this.shadow.innerHTML = ''
      this.shadow.appendChild(container)
    }

    await 加载数据()
  }
}
