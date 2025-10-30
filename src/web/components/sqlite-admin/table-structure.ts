import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {
  表名?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyTableStructure extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['表名']
  static {
    this.注册组件('lsby-table-structure', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 结构容器: HTMLDivElement = document.createElement('div')

  public constructor(属性?: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    this.结构容器.style.flex = '1'
    this.结构容器.style.overflow = 'auto'
    this.结构容器.style.padding = '10px'

    this.shadow.appendChild(this.结构容器)

    await this.加载表结构()
  }

  protected override async 当变化时(属性名: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (属性名 === '表名') {
      await this.加载表结构()
    }
  }

  private async 加载表结构(): Promise<void> {
    let 表名 = await this.获得属性('表名')
    if (表名 === void 0 || 表名 === null) {
      this.显示消息('请选择表')
      return
    }

    try {
      let 结果 = await this.API管理器.请求post接口('/api/sqlite-admin/get-table-schema', { tableName: 表名 })
      if (结果.status === 'success') {
        this.渲染表结构(结果.data.columns)
      } else {
        this.显示消息('获取表结构失败')
      }
    } catch (错误) {
      console.error('获取表结构失败:', 错误)
      this.显示消息('获取表结构失败')
    }
  }

  private 渲染表结构(
    列列表: Array<{ name: string; type: string; notnull: number; pk: number; dflt_value: string | null }>,
  ): void {
    this.结构容器.innerHTML = ''

    let 标题 = document.createElement('h3')
    标题.textContent = `表结构 - ${this.获得属性('表名')}`
    标题.style.margin = '0 0 10px 0'
    标题.style.fontSize = '18px'
    this.结构容器.appendChild(标题)

    let 表 = document.createElement('table')
    表.style.width = '100%'
    表.style.borderCollapse = 'collapse'
    表.style.fontSize = '14px'

    // 表头
    let 表头行 = document.createElement('tr')
    let 表头列 = ['列名', '类型', '可空', '主键', '默认值']
    for (let 列名 of 表头列) {
      let 表头单元格 = document.createElement('th')
      表头单元格.textContent = 列名
      表头单元格.style.border = '1px solid var(--边框颜色)'
      表头单元格.style.padding = '8px'
      表头单元格.style.backgroundColor = 'var(--次要背景颜色)'
      表头单元格.style.textAlign = 'left'
      表头行.appendChild(表头单元格)
    }
    表.appendChild(表头行)

    // 数据行
    for (let 列 of 列列表) {
      let 数据行 = document.createElement('tr')
      let 单元格数据 = [
        列.name,
        列.type,
        列.notnull === 1 ? '否' : '是',
        列.pk === 1 ? '是' : '否',
        列.dflt_value ?? '',
      ]
      for (let 数据 of 单元格数据) {
        let 数据单元格 = document.createElement('td')
        数据单元格.textContent = 数据
        数据单元格.style.border = '1px solid var(--边框颜色)'
        数据单元格.style.padding = '8px'
        数据行.appendChild(数据单元格)
      }
      表.appendChild(数据行)
    }

    this.结构容器.appendChild(表)
  }

  private 显示消息(消息: string): void {
    this.结构容器.innerHTML = ''
    let 消息元素 = document.createElement('div')
    消息元素.textContent = 消息
    消息元素.style.display = 'flex'
    消息元素.style.justifyContent = 'center'
    消息元素.style.alignItems = 'center'
    消息元素.style.height = '100%'
    消息元素.style.fontSize = '18px'
    消息元素.style.color = 'var(--文本颜色)'
    this.结构容器.appendChild(消息元素)
  }
}
