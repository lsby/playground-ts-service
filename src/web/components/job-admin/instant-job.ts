import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { API管理器类 } from '../../global/class/api'
import { 创建元素 } from '../../global/create-element'
import { 显示模态框 } from '../../global/modal'
import { 普通按钮 } from '../general/base/button'
import { LsbyLog } from '../general/log/log'
import { LsbyDataTable, 数据表加载数据参数 } from '../general/table/data-table'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}
type 任务数据项 = {
  id: string
  名称: string
  状态: string
  优先级: number
  创建时间: string
  开始时间: string | null
  结束时间: string | null
  执行时长: number | null
  重试次数: number
  错误信息: string | null
  输出结果: string
  日志列表长度: number
}

export class 测试任务组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-job-admin', this)
  }

  private api管理器 = new API管理器类()
  private 数据表格组件: LsbyDataTable<任务数据项>
  private 所有任务数据: 任务数据项[] = []
  private 当前任务详情WS: WebSocket | null = null

  public constructor(属性?: 属性类型) {
    super(属性)
    this.数据表格组件 = new LsbyDataTable({
      列配置: [
        { 字段名: '名称', 显示名: '任务名称', 可排序: true },
        { 字段名: '状态', 显示名: '状态', 可排序: true },
        { 字段名: '优先级', 显示名: '优先级', 可排序: true },
        { 字段名: '创建时间', 显示名: '创建时间', 可排序: true },
        { 字段名: '执行时长', 显示名: '执行时长(ms)', 可排序: true },
        { 字段名: '重试次数', 显示名: '重试次数', 可排序: true },
      ],
      操作列表: [
        {
          名称: '详情',
          回调: async (任务: 任务数据项): Promise<void> => {
            await this.显示任务详情(任务)
          },
        },
      ],
      每页数量: 10,
      加载数据: this.创建加载数据函数(),
    })
  }

  private 创建加载数据函数(): (参数: 数据表加载数据参数<任务数据项>) => Promise<{ 数据: 任务数据项[]; 总数: number }> {
    return async (参数: 数据表加载数据参数<任务数据项>) => {
      let 数据 = this.所有任务数据

      // 应用筛选
      if (参数.筛选条件 !== void 0) {
        for (let [key, value] of Object.entries(参数.筛选条件)) {
          if (value !== '') {
            数据 = 数据.filter((项) =>
              String(项[key as keyof 任务数据项])
                .toLowerCase()
                .includes(value.toLowerCase()),
            )
          }
        }
      }

      // 应用排序
      if (参数.排序列表 !== void 0 && 参数.排序列表.length > 0) {
        let 排序项 = 参数.排序列表[0]
        if (排序项 !== void 0) {
          数据 = [...数据].sort((a, b) => {
            let a值 = a[排序项.field]
            let b值 = b[排序项.field]
            if (typeof a值 === 'string' && typeof b值 === 'string') {
              let 比较 = a值.localeCompare(b值)
              return 排序项.direction === 'asc' ? 比较 : -比较
            }
            if (typeof a值 === 'number' && typeof b值 === 'number') {
              return 排序项.direction === 'asc' ? a值 - b值 : b值 - a值
            }
            return 0
          })
        }
      }

      let 总数 = 数据.length
      let 开始索引 = (参数.页码 - 1) * 参数.每页数量
      let 结束索引 = 开始索引 + 参数.每页数量
      let 分页数据 = 数据.slice(开始索引, 结束索引)

      return { 数据: 分页数据, 总数 }
    }
  }

  private async 刷新任务列表(): Promise<void> {
    try {
      let 结果 = await API管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/list', {})
      this.所有任务数据 = 结果.任务列表.map((任务) => ({
        id: 任务.id,
        名称: 任务.名称,
        状态: 任务.状态,
        优先级: 任务.优先级,
        创建时间: new Date(任务.创建时间).toLocaleString(),
        开始时间: 任务.开始时间 !== null ? new Date(任务.开始时间).toLocaleString() : null,
        结束时间: 任务.结束时间 !== null ? new Date(任务.结束时间).toLocaleString() : null,
        执行时长: 任务.执行时长,
        重试次数: 任务.重试次数,
        错误信息: 任务.错误信息,
        输出结果: 任务.输出结果 !== null ? String(任务.输出结果) : '',
        日志列表长度: 任务.日志列表.length,
      }))

      await this.数据表格组件.刷新数据()
    } catch (错误) {
      console.error('获取任务列表失败:', 错误)
    }
  }

  private async 显示任务详情(任务: 任务数据项): Promise<void> {
    // 更新 URL
    window.history.pushState(null, '', `?type=instant&id=${任务.id}`)

    // 创建详情内容容器
    let 详情内容 = 创建元素('div', {
      style: {
        height: '100%',
      },
    })

    // 创建日志组件
    let 日志组件 = new LsbyLog({})
    日志组件.style.height = '400px'
    日志组件.style.width = '100%'

    // 更新日志显示的函数
    let 更新日志显示 = (日志: { 时间: number; 消息: string }): void => {
      let 日志消息 = `[${new Date(日志.时间).toLocaleString()}] ${日志.消息}`
      日志组件.添加日志(日志消息)
    }

    详情内容.appendChild(日志组件)

    // 显示模态框
    await 显示模态框(
      {
        标题: '任务详情',
        最大化: true,
        关闭回调: async () => {
          // 清除 URL 中的 id 参数
          let url = new URL(window.location.href)
          url.searchParams.delete('id')
          window.history.replaceState(null, '', url.pathname + url.search)

          if (this.当前任务详情WS !== null) {
            this.当前任务详情WS.close()
            this.当前任务详情WS = null
          }
        },
      },
      详情内容,
    )

    // 组件已挂载到DOM，现在设置加载状态
    日志组件.设置加载状态(true)

    // 直接用一个请求同时获取历史日志并建立WebSocket连接
    this.api管理器
      .请求post接口并处理错误(
        '/api/job-admin/instant-job-admin/get-log',
        { 任务id: 任务.id },
        async (ws数据) => {
          // 收到WebSocket消息，实时更新单条新日志
          更新日志显示(ws数据.新日志)
        },
        async (ws) => {
          // WS连接成功时存储WS对象
          this.当前任务详情WS = ws
        },
      )
      .then((结果) => {
        // 显示历史日志
        结果.日志列表.forEach((日志) => {
          更新日志显示(日志)
        })
        // 隐藏加载状态
        日志组件.设置加载状态(false)
      })
      .catch((错误) => {
        console.error('获取任务日志失败:', 错误)
        // 即使出错也要隐藏加载状态
        日志组件.设置加载状态(false)
      })
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let 主容器 = 创建元素('div', {
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

    let 刷新按钮 = new 普通按钮({
      文本: '刷新',
      点击处理函数: async (): Promise<void> => {
        await this.刷新任务列表()
      },
    })

    操作区.appendChild(刷新按钮)

    主容器.appendChild(操作区)
    主容器.appendChild(this.数据表格组件)

    this.shadow.appendChild(主容器)

    // 初始加载数据
    await this.刷新任务列表()

    // 检查 URL 参数，如果有 type=instant 和 id，自动显示详情
    let urlParams = new URLSearchParams(window.location.search)
    let type = urlParams.get('type')
    let id = urlParams.get('id')
    if (type === 'instant' && id !== null) {
      let 任务 = this.所有任务数据.find((任务) => 任务.id === id)
      if (任务 !== void 0) {
        await this.显示任务详情(任务)
      }
    }
  }
}
