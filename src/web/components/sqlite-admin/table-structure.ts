import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { LsbyDataTable, 数据表加载数据参数 } from '../general/table/data-table'

type 属性类型 = {
  表名?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

type 表结构数据项 = {
  列名: string
  类型: string
  可空: string
  主键: string
  默认值: string
}

export class LsbyTableStructure extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['表名']
  static {
    this.注册组件('lsby-table-structure', this)
  }

  private 结构容器: HTMLDivElement | null = null
  private 表格组件: LsbyDataTable<表结构数据项> | null = null

  public constructor(属性?: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'
    style.minWidth = '0'
    style.overflow = 'hidden'

    this.结构容器 = 创建元素('div', {
      style: {
        flex: '1',
        overflow: 'auto',
        padding: '10px',
        minWidth: '0',
      },
    })

    this.shadow.appendChild(this.结构容器)

    await this.初始化表格()
  }

  protected override async 当变化时(_属性名: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    await this.初始化表格()
  }

  private async 初始化表格(): Promise<void> {
    let 表名 = await this.获得属性('表名')

    // 清空旧表格
    if (this.表格组件 !== null) {
      this.表格组件.remove()
      this.表格组件 = null
    }

    if (表名 === void 0 || 表名 === null) {
      if (this.结构容器 !== null) {
        this.结构容器.textContent = '请选择表'
        this.结构容器.style.display = 'flex'
      }
      return
    }

    if (this.结构容器 !== null) {
      this.结构容器.style.display = 'none'
    }

    // 创建表格
    this.表格组件 = new LsbyDataTable<表结构数据项>({
      列配置: [
        { 字段名: '列名', 显示名: '列名', 可排序: false },
        { 字段名: '类型', 显示名: '类型', 可排序: false },
        { 字段名: '可空', 显示名: '可空', 可排序: false },
        { 字段名: '主键', 显示名: '主键', 可排序: false },
        { 字段名: '默认值', 显示名: '默认值', 可排序: false },
      ],
      每页数量: 50,
      加载数据: async (参数: 数据表加载数据参数<表结构数据项>): Promise<{ 数据: 表结构数据项[]; 总数: number }> => {
        let 表名 = await this.获得属性('表名')
        if (表名 === void 0 || 表名 === null) {
          return { 数据: [], 总数: 0 }
        }

        try {
          let 结果 = await API管理器.请求post接口('/api/sqlite-admin/get-table-schema', { tableName: 表名 })
          if (结果.status === 'success') {
            let 数据: 表结构数据项[] = (
              结果.data.columns as Array<{
                name: string
                type: string
                notnull: number
                pk: number
                dflt_value: string | null
              }>
            ).map((列) => ({
              列名: 列.name,
              类型: 列.type,
              可空: 列.notnull === 1 ? '否' : '是',
              主键: 列.pk === 1 ? '是' : '否',
              默认值: 列.dflt_value ?? '',
            }))

            // 应用分页
            let 偏移 = (参数.页码 - 1) * 参数.每页数量
            let 分页数据 = 数据.slice(偏移, 偏移 + 参数.每页数量)

            return { 数据: 分页数据, 总数: 数据.length }
          }
          return { 数据: [], 总数: 0 }
        } catch (错误) {
          console.error('获取表结构失败:', 错误)
          return { 数据: [], 总数: 0 }
        }
      },
    })

    // 添加表格到 shadow DOM
    this.shadow.appendChild(this.表格组件)
  }
}
