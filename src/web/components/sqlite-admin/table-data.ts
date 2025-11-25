import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 共享表格管理器 } from './shared-table'

type 属性类型 = {
  表名?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

type 过滤项 = {
  列: string | null
  文本: string
}

export class LsbyTableData extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['表名']
  static {
    this.注册组件('lsby-table-data', this)
  }

  private 数据容器: HTMLDivElement | null = null
  private 每页条数选择: HTMLSelectElement | null = null
  private 分页容器: HTMLDivElement | null = null
  private 消息容器: HTMLDivElement | null = null

  private 当前页: number = 1
  private 每页条数: number = 100
  private 总条数: number = 0

  private 主键列: string[] = []
  private 表格管理器: 共享表格管理器 | null = null
  private 当前排序列: string | null = null
  private 当前排序方向: 'asc' | 'desc' | null = null

  private 列列表: any[] = []
  private 过滤项列表: 过滤项[] = []
  private 过滤容器: HTMLDivElement | null = null

  public constructor(属性?: 属性类型) {
    super(属性)
  }

  private 创建过滤项行(索引: number): HTMLDivElement {
    let 行容器 = 创建元素('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px',
      },
    })

    let 过滤列标签 = 创建元素('label', {
      textContent: '过滤列:',
    })
    let 过滤列选择 = 创建元素('select', {
      style: {
        padding: '4px',
        cursor: 'pointer',
      },
    })

    // 添加默认选项
    let 默认选项 = 创建元素('option', {
      value: '',
      textContent: '选择列',
    })
    过滤列选择.appendChild(默认选项)

    // 添加列选项
    for (let 列 of this.列列表) {
      let 选项 = 创建元素('option', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: 列.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        textContent: 列.name,
      })
      过滤列选择.appendChild(选项)
    }

    过滤列选择.addEventListener('change', () => {
      let 项 = this.过滤项列表[索引]
      if (项 !== void 0) {
        项.列 = 过滤列选择.value === '' ? null : 过滤列选择.value
        this.当前页 = 1
        void this.加载表数据()
      }
    })

    let 过滤输入标签 = 创建元素('label', {
      textContent: '过滤文本:',
    })
    let 过滤输入框 = 创建元素('input', {
      type: 'text',
      placeholder: '输入过滤文本',
      style: {
        padding: '4px',
        flex: '1',
      },
    })
    过滤输入框.addEventListener('input', () => {
      let 项 = this.过滤项列表[索引]
      if (项 !== void 0) {
        项.文本 = 过滤输入框.value
        this.当前页 = 1
        void this.加载表数据()
      }
    })

    // 设置当前值
    let 当前项 = this.过滤项列表[索引]
    if (当前项 !== void 0) {
      过滤列选择.value = 当前项.列 ?? ''
      过滤输入框.value = 当前项.文本
    }

    let 添加按钮 = 创建元素('button', {
      textContent: '+',
      style: {
        padding: '4px 8px',
        cursor: 'pointer',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
      },
    })
    添加按钮.addEventListener('click', () => {
      this.过滤项列表.push({ 列: null, 文本: '' })
      this.更新过滤容器()
    })

    let 删除按钮 = 创建元素('button', {
      textContent: '-',
      style: {
        padding: '4px 8px',
        cursor: 'pointer',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
      },
    })
    删除按钮.addEventListener('click', () => {
      if (this.过滤项列表.length > 1) {
        this.过滤项列表.splice(索引, 1)
        this.更新过滤容器()
      }
    })

    // 如果只有一行，禁用删除按钮
    if (this.过滤项列表.length === 1) {
      删除按钮.disabled = true
      删除按钮.style.opacity = '0.5'
      删除按钮.style.cursor = 'not-allowed'
    }

    行容器.appendChild(过滤列标签)
    行容器.appendChild(过滤列选择)
    行容器.appendChild(过滤输入标签)
    行容器.appendChild(过滤输入框)
    行容器.appendChild(添加按钮)
    行容器.appendChild(删除按钮)

    return 行容器
  }

  private 更新过滤容器(): void {
    if (this.过滤容器 === null) return

    // 清空容器
    this.过滤容器.innerHTML = ''

    // 重新添加所有过滤项行
    for (let i = 0; i < this.过滤项列表.length; i++) {
      let 行 = this.创建过滤项行(i)
      this.过滤容器.appendChild(行)
    }
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'
    style.minWidth = '0'
    style.overflow = 'hidden'

    // 每页条数选择容器
    let 每页条数容器 = 创建元素('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        borderBottom: '1px solid var(--边框颜色)',
      },
    })

    let 每页条数标签 = 创建元素('label', {
      textContent: '每页条数:',
    })
    this.每页条数选择 = 创建元素('select', {
      style: {
        padding: '4px',
        cursor: 'pointer',
      },
    })
    // 添加每页条数选项
    let 选项值列表 = [10, 50, 100, 200, 500]
    for (let 值 of 选项值列表) {
      let 选项 = 创建元素('option', {
        value: String(值),
        textContent: String(值),
      })
      if (值 === this.每页条数) {
        选项.selected = true
      }
      this.每页条数选择.appendChild(选项)
    }
    this.每页条数选择.addEventListener('change', () => {
      if (this.每页条数选择 !== null) {
        this.每页条数 = parseInt(this.每页条数选择.value)
        this.当前页 = 1
        void this.加载表数据()
      }
    })

    每页条数容器.appendChild(每页条数标签)
    每页条数容器.appendChild(this.每页条数选择)

    // 初始化过滤项列表
    this.过滤项列表 = [{ 列: null, 文本: '' }]

    // 过滤容器
    this.过滤容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        padding: '10px',
        borderBottom: '1px solid var(--边框颜色)',
      },
    })

    this.更新过滤容器()

    this.数据容器 = 创建元素('div', {
      style: {
        flex: '1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minWidth: '0',
        minHeight: '0',
      },
    })

    // 初始化表格管理器
    this.表格管理器 = new 共享表格管理器(this.数据容器, {
      可编辑: true,
      数据更新回调: async (): Promise<void> => {
        // 单元格编辑后不需要重新加载整个表数据
        // 数据已经在 shared-table.ts 中更新了
        // 如果需要刷新特定内容,可以在这里添加
      },
      排序回调: async (排序列: string | null, 排序方向: 'asc' | 'desc' | null): Promise<void> => {
        this.当前排序列 = 排序列
        this.当前排序方向 = 排序方向
        this.当前页 = 1 // 排序时重置到第一页
        await this.加载表数据()
      },
    })

    // 创建分页容器
    this.分页容器 = 创建元素('div', {
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
      disabled: this.当前页 <= 1,
      style: {
        padding: '6px 16px',
        cursor: this.当前页 <= 1 ? 'not-allowed' : 'pointer',
      },
      onclick: async (): Promise<void> => {
        if (this.当前页 > 1) {
          this.当前页 -= 1
          await this.加载表数据()
        }
      },
    })
    this.分页容器.appendChild(上一页按钮)

    // 页码显示
    let 页码显示 = 创建元素('span', {
      textContent: `第 ${this.当前页} 页 / 共 ${Math.ceil(this.总条数 / this.每页条数)} 页 (总共 ${this.总条数} 条)`,
      style: {
        margin: '0 8px',
        color: 'var(--color-text-secondary)',
      },
    })
    this.分页容器.appendChild(页码显示)

    // 下一页按钮
    let 下一页按钮 = 创建元素('button', {
      textContent: '下一页',
      disabled: this.当前页 >= Math.ceil(this.总条数 / this.每页条数),
      style: {
        padding: '6px 16px',
        cursor: this.当前页 >= Math.ceil(this.总条数 / this.每页条数) ? 'not-allowed' : 'pointer',
      },
      onclick: async (): Promise<void> => {
        if (this.当前页 < Math.ceil(this.总条数 / this.每页条数)) {
          this.当前页 += 1
          await this.加载表数据()
        }
      },
    })
    this.分页容器.appendChild(下一页按钮)

    // 创建消息容器
    this.消息容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '18px',
        color: 'var(--文本颜色)',
      },
      textContent: '请选择表',
    })

    this.shadow.appendChild(每页条数容器)
    this.shadow.appendChild(this.过滤容器)
    this.shadow.appendChild(this.数据容器)
    this.shadow.appendChild(this.分页容器)
    this.shadow.appendChild(this.消息容器)

    await this.加载表数据()
    this.更新过滤容器()
  }

  protected override async 当变化时(属性名: keyof 属性类型): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (属性名 === '表名') {
      // 切换表时重置排序状态和过滤状态
      this.当前排序列 = null
      this.当前排序方向 = null
      this.过滤项列表 = [{ 列: null, 文本: '' }]
      await this.加载表数据()
      this.更新过滤容器()
    }
  }

  private 构建过滤条件(): { where子句: string; 参数列表: (string | number)[] } {
    let 条件列表: string[] = []
    let 参数列表: (string | number)[] = []

    for (let 过滤项 of this.过滤项列表) {
      if (过滤项.列 !== null && 过滤项.文本 !== '') {
        条件列表.push('`' + 过滤项.列 + '` LIKE ?')
        参数列表.push('%' + 过滤项.文本 + '%')
      }
    }

    let where子句 = 条件列表.length > 0 ? ' WHERE ' + 条件列表.join(' AND ') : ''
    return { where子句, 参数列表 }
  }

  private async 获取表结构(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    try {
      let 结果 = await API管理器.请求post接口('/api/sqlite-admin/get-table-schema', { tableName: 表名 })
      if (结果.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        this.主键列 = 结果.data.columns.filter((列: any) => 列.pk === 1).map((列: any) => 列.name)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        this.列列表 = 结果.data.columns
      } else {
        console.error('获取表结构失败:', 结果)
        this.主键列 = []
        this.列列表 = []
      }
    } catch (错误) {
      console.error('获取表结构失败:', 错误)
      this.主键列 = []
      this.列列表 = []
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
      let 总条数参数列表: (string | number)[] = []

      // 添加过滤
      let 过滤条件 = this.构建过滤条件()
      总条数SQL += 过滤条件.where子句
      总条数参数列表.push(...过滤条件.参数列表)

      let 总条数结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql: 总条数SQL,
        parameters: 总条数参数列表,
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

      // 更新分页
      if (this.分页容器 !== null) {
        let 上一页按钮 = this.分页容器.children[0] as HTMLButtonElement
        let 页码显示 = this.分页容器.children[1] as HTMLSpanElement
        let 下一页按钮 = this.分页容器.children[2] as HTMLButtonElement

        let 总页数 = Math.ceil(this.总条数 / this.每页条数)
        上一页按钮.disabled = this.当前页 <= 1
        上一页按钮.style.cursor = this.当前页 <= 1 ? 'not-allowed' : 'pointer'
        页码显示.textContent = `第 ${this.当前页} 页 / 共 ${总页数} 页 (总共 ${this.总条数} 条)`
        下一页按钮.disabled = this.当前页 >= 总页数
        下一页按钮.style.cursor = this.当前页 >= 总页数 ? 'not-allowed' : 'pointer'
      }

      // 查询当前页数据
      let 偏移 = (this.当前页 - 1) * this.每页条数
      let 数据SQL = 'SELECT * FROM `' + 表名 + '`'
      let 参数列表: (string | number)[] = []

      // 添加过滤
      过滤条件 = this.构建过滤条件()
      数据SQL += 过滤条件.where子句
      参数列表.push(...过滤条件.参数列表)

      // 添加排序
      if (this.当前排序列 !== null && this.当前排序方向 !== null) {
        数据SQL += ' ORDER BY `' + this.当前排序列 + '` ' + (this.当前排序方向 === 'asc' ? 'ASC' : 'DESC')
      }

      // 添加分页
      数据SQL += ' LIMIT ? OFFSET ?'
      参数列表.push(this.每页条数, 偏移)

      let 数据结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql: 数据SQL,
        parameters: 参数列表,
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
