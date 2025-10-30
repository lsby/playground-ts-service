import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'
import { 共享表格管理器 } from './shared-table'

type 属性类型 = {
  表名?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyTableData extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['表名']
  static {
    this.注册组件('lsby-table-data', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 数据容器: HTMLDivElement | null = null
  private 每页条数选择: HTMLSelectElement | null = null
  private 上一页按钮: HTMLButtonElement | null = null
  private 下一页按钮: HTMLButtonElement | null = null
  private 页码显示: HTMLSpanElement | null = null
  private 消息容器: HTMLDivElement | null = null

  private 当前页: number = 1
  private 每页条数: number = 100
  private 总条数: number = 0

  private 主键列: string[] = []
  private 表格管理器: 共享表格管理器 | null = null

  public constructor(属性?: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    // 分页控制面板
    let 分页面板 = document.createElement('div')
    分页面板.style.display = 'flex'
    分页面板.style.gap = '10px'
    分页面板.style.padding = '10px'
    分页面板.style.borderBottom = '1px solid var(--边框颜色)'
    分页面板.style.alignItems = 'center'
    分页面板.style.justifyContent = 'space-between'

    // 左侧：每页条数选择
    let 左侧容器 = document.createElement('div')
    左侧容器.style.display = 'flex'
    左侧容器.style.alignItems = 'center'
    左侧容器.style.gap = '10px'

    let 每页条数标签 = document.createElement('label')
    每页条数标签.textContent = '每页条数:'
    this.每页条数选择 = document.createElement('select')
    this.每页条数选择.innerHTML = `
      <option value="50">50</option>
      <option value="100" selected>100</option>
      <option value="200">200</option>
      <option value="500">500</option>
    `
    this.每页条数选择.style.padding = '4px'
    this.每页条数选择.style.cursor = 'pointer'
    this.每页条数选择.addEventListener('change', () => {
      if (this.每页条数选择 !== null) {
        this.每页条数 = parseInt(this.每页条数选择.value)
        this.当前页 = 1
        void this.加载表数据()
      }
    })

    左侧容器.appendChild(每页条数标签)
    左侧容器.appendChild(this.每页条数选择)

    // 右侧：分页按钮和页码显示
    let 右侧容器 = document.createElement('div')
    右侧容器.style.display = 'flex'
    右侧容器.style.alignItems = 'center'
    右侧容器.style.gap = '10px'

    this.上一页按钮 = document.createElement('button')
    this.上一页按钮.textContent = '上一页'
    this.上一页按钮.style.padding = '6px 12px'
    this.上一页按钮.style.cursor = 'pointer'
    this.上一页按钮.addEventListener('click', () => {
      if (this.当前页 > 1) {
        this.当前页--
        void this.加载表数据()
      }
    })

    this.页码显示 = document.createElement('span')
    this.页码显示.textContent = '第 1 页 / 共 1 页'
    this.页码显示.style.padding = '6px 12px'
    this.页码显示.style.minWidth = '120px'
    this.页码显示.style.textAlign = 'center'

    this.下一页按钮 = document.createElement('button')
    this.下一页按钮.textContent = '下一页'
    this.下一页按钮.style.padding = '6px 12px'
    this.下一页按钮.style.cursor = 'pointer'
    this.下一页按钮.addEventListener('click', () => {
      let 总页数 = Math.ceil(this.总条数 / this.每页条数)
      if (this.当前页 < 总页数) {
        this.当前页++
        void this.加载表数据()
      }
    })

    右侧容器.appendChild(this.上一页按钮)
    右侧容器.appendChild(this.页码显示)
    右侧容器.appendChild(this.下一页按钮)

    分页面板.appendChild(左侧容器)
    分页面板.appendChild(右侧容器)

    this.数据容器 = document.createElement('div')
    this.数据容器.style.flex = '1'
    this.数据容器.style.overflow = 'auto'
    this.数据容器.style.display = 'flex'
    this.数据容器.style.flexDirection = 'column'
    this.数据容器.style.position = 'relative'

    // 初始化表格管理器
    this.表格管理器 = new 共享表格管理器(this.数据容器, {
      可编辑: true,
      数据更新回调: async (): Promise<void> => {
        await this.加载表数据()
      },
    })

    // 创建消息容器
    this.消息容器 = document.createElement('div')
    this.消息容器.style.display = 'flex'
    this.消息容器.style.justifyContent = 'center'
    this.消息容器.style.alignItems = 'center'
    this.消息容器.style.height = '100%'
    this.消息容器.style.fontSize = '18px'
    this.消息容器.style.color = 'var(--文本颜色)'
    this.消息容器.textContent = '请选择表'

    this.shadow.appendChild(this.数据容器)
    this.shadow.appendChild(this.消息容器)
    this.shadow.appendChild(分页面板)

    await this.加载表数据()
  }

  protected override async 当变化时(属性名: keyof 属性类型): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (属性名 === '表名') {
      await this.加载表数据()
    }
  }

  private async 获取表结构(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    try {
      let 结果 = await this.API管理器.请求post接口('/api/sqlite-admin/get-table-schema', { tableName: 表名 })
      if (结果.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        this.主键列 = 结果.data.columns.filter((列: any) => 列.pk === 1).map((列: any) => 列.name)
      } else {
        console.error('获取表结构失败:', 结果)
        this.主键列 = []
      }
    } catch (错误) {
      console.error('获取表结构失败:', 错误)
      this.主键列 = []
    }
  }

  private async 加载表数据(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) {
      if (this.数据容器 !== null) {
        this.数据容器.style.display = 'none'
      }
      if (this.消息容器 !== null) {
        this.消息容器.style.display = 'flex'
        this.消息容器.textContent = '请选择表'
      }
      return
    }

    // 有表名时，显示数据容器，隐藏消息容器
    if (this.数据容器 !== null) {
      this.数据容器.style.display = 'flex'
    }
    if (this.消息容器 !== null) {
      this.消息容器.style.display = 'none'
    }

    // 获取表结构
    await this.获取表结构()

    try {
      // 先查询总条数
      let 总条数SQL = 'SELECT COUNT(*) as count FROM `' + 表名 + '`'
      let 总条数结果 = await this.API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql: 总条数SQL,
        parameters: [],
      })
      if (总条数结果.status !== 'success' || 总条数结果.data.rows.length === 0 || 总条数结果.data.rows[0] === void 0) {
        if (this.表格管理器 !== null) {
          this.表格管理器.更新数据([])
        }
        return
      }
      let 总条数字符串 = String(总条数结果.data.rows[0]['count'] !== void 0 ? 总条数结果.data.rows[0]['count'] : '0')
      let 解析后的总条数 = parseInt(总条数字符串)
      this.总条数 = isNaN(解析后的总条数) === false ? 解析后的总条数 : 0

      // 计算总页数并更新页码显示
      let 总页数 = Math.ceil(this.总条数 / this.每页条数)
      if (this.页码显示 !== null) {
        this.页码显示.textContent = `第 ${this.当前页} 页 / 共 ${总页数} 页`
      }

      // 更新按钮状态
      if (this.上一页按钮 !== null) {
        this.上一页按钮.disabled = this.当前页 <= 1
      }
      if (this.下一页按钮 !== null) {
        this.下一页按钮.disabled = this.当前页 >= 总页数
      }

      // 查询当前页数据
      let 偏移 = (this.当前页 - 1) * this.每页条数
      let 数据SQL = 'SELECT * FROM `' + 表名 + '` LIMIT ? OFFSET ?'
      let 数据结果 = await this.API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql: 数据SQL,
        parameters: [this.每页条数, 偏移],
      })
      if (数据结果.status === 'success' && this.表格管理器 !== null) {
        // 更新表格管理器的选项
        this.表格管理器.更新选项({
          表名: 表名,
          主键列: this.主键列,
        })
        // 更新表格数据
        this.表格管理器.更新数据(数据结果.data.rows)
      } else {
        if (this.表格管理器 !== null) {
          this.表格管理器.更新数据([])
        }
      }
    } catch (错误) {
      console.error('查询数据失败:', 错误)
      if (this.表格管理器 !== null) {
        this.表格管理器.更新数据([])
      }
    }
  }
}
