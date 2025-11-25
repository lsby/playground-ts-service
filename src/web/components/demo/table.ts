import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 显示确认对话框, 显示输入对话框 } from '../../global/dialog'
import { 警告提示 } from '../../global/toast'
import type { 数据表加载数据参数 } from '../general/data-table'
import { LsbyDataTable } from '../general/data-table'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

type 数据项 = { id: string; name: string }

export class 测试表格组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-table', this)
  }

  private 表格组件: LsbyDataTable<数据项>

  public constructor() {
    super()
    this.表格组件 = new LsbyDataTable<数据项>({
      列配置: [
        { 字段名: 'id', 显示名: 'ID', 可排序: true },
        { 字段名: 'name', 显示名: '名称', 可排序: true },
      ],
      每页数量: 5,
      操作列表: [
        {
          名称: '编辑',
          回调: async (数据项: 数据项): Promise<void> => {
            let name = await 显示输入对话框('请输入新名称:', 数据项.name)
            if (name === null || name === '') {
              await 警告提示('未输入数据')
              return
            }
            await API管理器.请求post接口并处理错误('/api/demo/user-crud/update', {
              newName: name,
              userId: 数据项.id,
            })
          },
        },
        {
          名称: '删除',
          回调: async (数据项: 数据项): Promise<void> => {
            let 确认结果 = await 显示确认对话框('你确定要删除这条数据吗？')
            if (确认结果 === false) return
            await API管理器.请求post接口并处理错误('/api/demo/user-crud/delete', { id: 数据项.id })
          },
        },
      ],
      加载数据: async (参数: 数据表加载数据参数<数据项>): Promise<{ 数据: 数据项[]; 总数: number }> => {
        let { data, total } = await API管理器.请求post接口并处理错误('/api/demo/user-crud/read', {
          page: 参数.页码,
          size: 参数.每页数量,
          ...(参数.排序列表 !== void 0 && 参数.排序列表.length > 0 ? { orderBy: 参数.排序列表 } : {}),
          ...(参数.筛选条件 !== void 0 && Object.keys(参数.筛选条件).length > 0 ? { filter: 参数.筛选条件 } : {}),
        })
        return { 数据: data, 总数: total }
      },
    })
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        gap: '16px',
      },
    })

    // 顶部操作区
    let 操作区 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
      },
    })

    let 添加按钮 = 创建元素('button', {
      textContent: '添加数据',
      style: {
        padding: '6px 16px',
      },
      onclick: async (): Promise<void> => {
        let name = await 显示输入对话框('请输入名称:')
        if (name === null || name === '') {
          await 警告提示('未输入数据')
          return
        }
        let pwd = await 显示输入对话框('请输入密码:')
        if (pwd === null || pwd === '') {
          await 警告提示('未输入数据')
          return
        }
        await API管理器.请求post接口并处理错误('/api/demo/user-crud/create', { name: name, pwd: pwd })
        await this.表格组件.刷新数据()
      },
    })
    操作区.appendChild(添加按钮)

    容器.appendChild(操作区)
    容器.appendChild(this.表格组件)

    this.shadow.appendChild(容器)
  }
}
