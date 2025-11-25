import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 显示确认对话框, 显示输入对话框 } from '../../global/dialog'
import { 警告提示 } from '../../global/toast'
import { LsbyPagination } from '../general/pagination'
import { LsbyTableView } from '../general/table-view'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}
type 数据项 = { id: string; name: string }

export class 测试表格组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-table', this)
  }

  private 表格组件 = new LsbyTableView()
  private 分页组件 = new LsbyPagination()
  private 当前排序字段: string | null = null
  private 当前排序方向: 'asc' | 'desc' | null = null

  private async 加载数据(
    页码: number,
    每页数量: number,
    排序字段?: string | null,
    排序方向?: 'asc' | 'desc' | null,
  ): Promise<void> {
    let 请求参数: any = {
      page: 页码,
      size: 每页数量,
    }
    if (排序字段 !== null && 排序字段 !== void 0 && 排序方向 !== null && 排序方向 !== void 0) {
      请求参数.orderBy = 排序字段
      请求参数.orderDirection = 排序方向
    }
    let { data, total } = await API管理器.请求post接口并处理错误('/api/demo/user-crud/read', 请求参数)

    this.表格组件.设置数据({
      列配置: [
        { 字段名: 'id', 显示名: 'ID', 可排序: true },
        { 字段名: 'name', 显示名: '名称', 可排序: true },
      ],
      数据列表: data,
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
            await this.加载数据(
              this.分页组件.获得当前页码(),
              this.分页组件.获得每页数量(),
              this.当前排序字段,
              this.当前排序方向,
            )
          },
        },
        {
          名称: '删除',
          回调: async (数据项: 数据项): Promise<void> => {
            let 确认结果 = await 显示确认对话框('你确定要删除这条数据吗？')
            if (确认结果 === false) return
            await API管理器.请求post接口并处理错误('/api/demo/user-crud/delete', { id: 数据项.id })
            await this.加载数据(
              this.分页组件.获得当前页码(),
              this.分页组件.获得每页数量(),
              this.当前排序字段,
              this.当前排序方向,
            )
          },
        },
      ],
    })

    this.分页组件.设置配置({
      当前页码: 页码,
      每页数量: 每页数量,
      总数量: total,
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
        await this.加载数据(
          this.分页组件.获得当前页码(),
          this.分页组件.获得每页数量(),
          this.当前排序字段,
          this.当前排序方向,
        )
      },
    })
    操作区.appendChild(添加按钮)

    // 分页监听
    this.分页组件.设置页码变化回调(async (页码): Promise<void> => {
      await this.加载数据(页码, this.分页组件.获得每页数量(), this.当前排序字段, this.当前排序方向)
    })

    容器.appendChild(操作区)
    容器.appendChild(this.表格组件)
    容器.appendChild(this.分页组件)

    this.shadow.appendChild(容器)

    // 设置排序变化回调
    this.表格组件.设置排序变化回调(async (排序字段, 排序方向): Promise<void> => {
      this.当前排序字段 = 排序字段
      this.当前排序方向 = 排序方向
      await this.加载数据(this.分页组件.获得当前页码(), this.分页组件.获得每页数量(), 排序字段, 排序方向)
    })

    // 初始加载
    await this.加载数据(1, 5)
  }
}
