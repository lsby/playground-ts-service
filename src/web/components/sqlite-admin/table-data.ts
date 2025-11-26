import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 显示确认对话框 } from '../../global/dialog'
import { 关闭模态框, 显示模态框 } from '../../global/modal'
import { 警告提示 } from '../../global/toast'
import { 主要按钮, 普通按钮 } from '../general/base/button'
import { LsbyDataTable, 数据表加载数据参数 } from '../general/table/data-table'

type 属性类型 = {
  表名?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

type 数据项 = Record<string, any>

export class LsbyTableData extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['表名']
  static {
    this.注册组件('lsby-table-data', this)
  }

  private 表格组件: LsbyDataTable<数据项> | null = null
  private 消息容器: HTMLDivElement | null = null
  private 列列表: {
    type: string
    name: string
    notnull: number
    pk: number
    dflt_value: string | null
  }[] = []
  private 主键列: string[] = []

  public constructor(属性?: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'
    style.overflow = 'hidden'

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

    this.shadow.appendChild(this.消息容器)

    await this.当变化时('表名')
  }

  protected override async 当变化时(_属性名: keyof 属性类型): Promise<void> {
    await this.初始化表格()
  }

  private async 获取表结构(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    try {
      let 结果 = await API管理器.请求post接口('/api/sqlite-admin/get-table-schema', { tableName: 表名 })
      if (结果.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        this.主键列 = 结果.data.columns.filter((列) => 列.pk === 1).map((列) => 列.name)
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

  private async 初始化表格(): Promise<void> {
    let 表名 = await this.获得属性('表名')

    // 清空旧表格
    if (this.表格组件 !== null) {
      this.表格组件.remove()
      this.表格组件 = null
    }

    if (表名 === void 0 || 表名 === null) {
      if (this.消息容器 !== null) {
        this.消息容器.textContent = '请选择表'
        this.消息容器.style.display = 'flex'
      }
      return
    }

    await this.获取表结构()

    if (this.消息容器 !== null) {
      this.消息容器.style.display = 'none'
    }

    // 创建表格
    this.表格组件 = new LsbyDataTable<数据项>({
      列配置: this.列列表.map((列) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        字段名: 列.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        显示名: 列.name,
        可排序: true,
      })),
      每页数量: 20,
      操作列表: [
        {
          名称: '编辑',
          回调: async (数据项: 数据项): Promise<void> => {
            await this.显示编辑模态框(数据项)
          },
        },
        {
          名称: '删除',
          回调: async (数据项: 数据项): Promise<void> => {
            let 确认 = await 显示确认对话框('确定要删除这条数据吗？')
            if (确认 === false) return
            await this.删除行(数据项)
          },
        },
      ],
      顶部操作列表: [
        {
          名称: '添加',
          回调: async (): Promise<void> => {
            await this.显示添加模态框()
          },
        },
      ],
      加载数据: async (参数: 数据表加载数据参数<数据项>): Promise<{ 数据: 数据项[]; 总数: number }> => {
        let 表名 = await this.获得属性('表名')
        if (表名 === void 0 || 表名 === null) {
          return { 数据: [], 总数: 0 }
        }

        try {
          // 构建排序语句
          let 排序语句 = ''
          if (参数.排序列表 !== void 0 && 参数.排序列表.length > 0) {
            let 排序条件列表 = 参数.排序列表.map((排序) => `\`${String(排序.field)}\` ${排序.direction.toUpperCase()}`)
            排序语句 = ' ORDER BY ' + 排序条件列表.join(', ')
          }

          // 构建筛选语句
          let 筛选语句 = ''
          let 筛选参数: (string | number)[] = []
          if (参数.筛选条件 !== void 0 && Object.keys(参数.筛选条件).length > 0) {
            let 筛选条件列表: string[] = []
            for (let [列名, 值] of Object.entries(参数.筛选条件)) {
              if (值 !== '') {
                筛选条件列表.push(`\`${列名}\` LIKE ?`)
                筛选参数.push('%' + 值 + '%')
              }
            }
            if (筛选条件列表.length > 0) {
              筛选语句 = ' WHERE ' + 筛选条件列表.join(' AND ')
            }
          }

          // 查询总数
          let 总数sql = `SELECT COUNT(*) as count FROM \`${表名}\`` + 筛选语句
          let 总数结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
            sql: 总数sql,
            parameters: 筛选参数,
          })

          let 总数 = 0
          if (总数结果.status === 'success' && 总数结果.data.rows.length > 0 && 总数结果.data.rows[0] !== void 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            总数 = parseInt(String(总数结果.data.rows[0]['count'] ?? 0))
          }

          // 查询数据
          let 偏移 = (参数.页码 - 1) * 参数.每页数量
          let sql = `SELECT * FROM \`${表名}\`` + 筛选语句 + 排序语句 + ` LIMIT ? OFFSET ?`
          筛选参数.push(参数.每页数量, 偏移)

          let 结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
            sql,
            parameters: 筛选参数,
          })

          if (结果.status === 'success') {
            return { 数据: 结果.data.rows, 总数 }
          }
          return { 数据: [], 总数: 0 }
        } catch (错误) {
          console.error('查询失败:', 错误)
          return { 数据: [], 总数: 0 }
        }
      },
      宿主样式: { margin: '20px' },
    })

    // 添加表格到 shadow DOM
    this.shadow.appendChild(this.表格组件)
  }

  private async 显示添加模态框(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    let 内容容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
    })

    // 为每个列创建输入框
    let 输入框映射: Map<string, HTMLInputElement> = new Map()

    for (let 列 of this.列列表) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let 列名 = 列.name
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let 是主键 = this.主键列.includes(列名)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let 列类型 = 列.type

      // 跳过主键列（通常是自增的）
      if (是主键) continue

      let 标签 = 创建元素('label', {
        textContent: 列名,
        style: {
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          color: 'var(--文字颜色)',
          fontWeight: 'bold',
        },
      })

      let 输入框 = 创建元素('input', {
        type: this.获得输入框类型(列类型),
        placeholder: `请输入 ${列名}`,
        style: {
          width: '100%',
          padding: '8px',
          border: '1px solid var(--边框颜色)',
          borderRadius: '4px',
          backgroundColor: 'var(--背景颜色)',
          color: 'var(--文字颜色)',
          boxSizing: 'border-box',
        },
      })

      输入框映射.set(列名, 输入框)
      内容容器.appendChild(标签)
      内容容器.appendChild(输入框)
    }

    // 按钮容器
    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--边框颜色)',
      },
    })

    let 取消按钮 = new 普通按钮({
      文本: '取消',
      点击处理函数: async (): Promise<void> => {
        await 关闭模态框()
      },
    })

    let 确认按钮 = new 主要按钮({
      文本: '添加',
      点击处理函数: async (): Promise<void> => {
        await this.保存新行(输入框映射)
      },
    })

    按钮容器.appendChild(取消按钮)
    按钮容器.appendChild(确认按钮)
    内容容器.appendChild(按钮容器)

    await 显示模态框({ 标题: '添加数据', 可关闭: true }, 内容容器)
  }

  private async 显示编辑模态框(行数据: 数据项): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    let 内容容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
    })

    // 为每个列创建输入框
    let 输入框映射: Map<string, HTMLInputElement> = new Map()

    for (let 列 of this.列列表) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let 列名 = 列.name
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let 列类型 = 列.type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let 当前值 = 行数据[列名]

      let 标签 = 创建元素('label', {
        textContent: 列名,
        style: {
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          color: 'var(--文字颜色)',
          fontWeight: 'bold',
        },
      })

      let 输入框 = 创建元素('input', {
        type: this.获得输入框类型(列类型),
        value: String(当前值 ?? ''),
        placeholder: `请输入 ${列名}`,
        style: {
          width: '100%',
          padding: '8px',
          border: '1px solid var(--边框颜色)',
          borderRadius: '4px',
          backgroundColor: 'var(--背景颜色)',
          color: 'var(--文字颜色)',
          boxSizing: 'border-box',
        },
      })

      输入框映射.set(列名, 输入框)
      内容容器.appendChild(标签)
      内容容器.appendChild(输入框)
    }

    // 按钮容器
    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--边框颜色)',
      },
    })

    let 取消按钮 = new 普通按钮({
      文本: '取消',
      点击处理函数: async (): Promise<void> => {
        await 关闭模态框()
      },
    })

    let 确认按钮 = new 主要按钮({
      文本: '保存',
      点击处理函数: async (): Promise<void> => {
        await this.保存编辑行(行数据, 输入框映射)
      },
    })

    按钮容器.appendChild(取消按钮)
    按钮容器.appendChild(确认按钮)
    内容容器.appendChild(按钮容器)

    await 显示模态框({ 标题: '编辑数据', 可关闭: true }, 内容容器)
  }

  private async 保存新行(输入框映射: Map<string, HTMLInputElement>): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    let 列列表: string[] = []
    let 值列表: string[] = []
    let 参数列表: (string | number)[] = []

    for (let [列名, 输入框] of 输入框映射) {
      let 值 = 输入框.value.trim()
      if (值 === '') {
        await 警告提示(`${列名} 不能为空`)
        return
      }
      列列表.push(`\`${列名}\``)
      值列表.push('?')
      参数列表.push(值)
    }

    let sql = `INSERT INTO \`${表名}\` (${列列表.join(', ')}) VALUES (${值列表.join(', ')})`

    try {
      await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql,
        parameters: 参数列表,
      })
      await 关闭模态框()
      if (this.表格组件 !== null) {
        await this.表格组件.刷新数据()
      }
    } catch (错误) {
      console.error('插入失败:', 错误)
      await 警告提示('添加失败')
    }
  }

  private async 保存编辑行(行数据: 数据项, 输入框映射: Map<string, HTMLInputElement>): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    if (this.主键列.length === 0) {
      await 警告提示('无法找到主键列')
      return
    }

    // 构建 SET 语句
    let 设置条件列表: string[] = []
    let 参数列表: (string | number)[] = []

    for (let [列名, 输入框] of 输入框映射) {
      let 值 = 输入框.value.trim()
      设置条件列表.push(`\`${列名}\` = ?`)
      参数列表.push(值)
    }

    // 构建 WHERE 语句
    let where条件列表: string[] = []
    for (let 主键列名 of this.主键列) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let 主键值 = 行数据[主键列名]
      where条件列表.push(`\`${主键列名}\` = ?`)
      参数列表.push(主键值)
    }

    let sql = `UPDATE \`${表名}\` SET ${设置条件列表.join(', ')} WHERE ${where条件列表.join(' AND ')}`

    try {
      await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql,
        parameters: 参数列表,
      })
      await 关闭模态框()
      if (this.表格组件 !== null) {
        await this.表格组件.刷新数据()
      }
    } catch (错误) {
      console.error('更新失败:', 错误)
      await 警告提示('保存失败')
    }
  }

  private async 删除行(行数据: 数据项): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) return

    if (this.主键列.length === 0) {
      await 警告提示('无法找到主键列')
      return
    }

    // 构建 WHERE 语句
    let where条件列表: string[] = []
    let 参数列表: (string | number)[] = []

    for (let 主键列名 of this.主键列) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let 主键值 = 行数据[主键列名]
      where条件列表.push(`\`${主键列名}\` = ?`)
      参数列表.push(主键值)
    }

    let sql = `DELETE FROM \`${表名}\` WHERE ${where条件列表.join(' AND ')}`

    try {
      await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
        sql,
        parameters: 参数列表,
      })
      if (this.表格组件 !== null) {
        await this.表格组件.刷新数据()
      }
    } catch (错误) {
      console.error('删除失败:', 错误)
      await 警告提示('删除失败')
    }
  }

  private 获得输入框类型(列类型: string): string {
    let 类型小写 = 列类型.toLowerCase()
    if (类型小写.includes('int')) return 'number'
    if (类型小写.includes('float') || 类型小写.includes('double') || 类型小写.includes('decimal')) {
      return 'number'
    }
    return 'text'
  }
}
