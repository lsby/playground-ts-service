import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { API管理器类 } from '../../global/class/api'
import { 创建元素 } from '../../global/create-element'
import { 显示模态框 } from '../../global/modal'
import { LsbyLog } from '../general/log'
import { LsbyPagination } from '../general/pagination'
import { LsbyTableView } from '../general/table-view'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}
type 定时任务数据项 = {
  id: string
  名称: string
  表达式: string
  状态: string
  下次执行时间: string | null
  最后执行时间: string | null
  执行次数: number
}

export class 定时任务组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-scheduled-job', this)
  }

  private api管理器 = new API管理器类()
  private 表格组件 = new LsbyTableView()
  private 分页组件 = new LsbyPagination()
  private 所有任务数据: 定时任务数据项[] = []
  private 当前任务详情WS: WebSocket | null = null

  private async 加载数据(页码: number, 每页数量: number): Promise<void> {
    let 开始索引 = (页码 - 1) * 每页数量
    let 结束索引 = 开始索引 + 每页数量
    let 分页数据 = this.所有任务数据.slice(开始索引, 结束索引)

    this.表格组件.设置数据({
      列配置: [
        { 字段名: '名称', 显示名: '任务名称' },
        { 字段名: '表达式', 显示名: 'Cron 表达式' },
        { 字段名: '状态', 显示名: '状态' },
        { 字段名: '下次执行时间', 显示名: '下次执行时间' },
        { 字段名: '最后执行时间', 显示名: '最后执行时间' },
        { 字段名: '执行次数', 显示名: '执行次数' },
      ],
      数据列表: 分页数据,
      操作列表: [
        {
          名称: '详情',
          回调: async (任务: 定时任务数据项): Promise<void> => {
            await this.显示任务详情(任务)
          },
        },
        {
          名称: '手动触发',
          回调: async (任务: 定时任务数据项): Promise<void> => {
            try {
              await API管理器.请求post接口并处理错误('/api/job-admin/scheduled-job-admin/manual-trigger', {
                任务id: 任务.id,
              })
              await this.刷新任务列表()
            } catch (错误) {
              console.error('手动触发任务失败:', 错误)
            }
          },
        },
      ],
    })

    this.分页组件.设置配置({
      当前页码: 页码,
      每页数量: 每页数量,
      总数量: this.所有任务数据.length,
    })
  }

  private async 刷新任务列表(): Promise<void> {
    try {
      let 结果 = await API管理器.请求post接口并处理错误('/api/job-admin/scheduled-job-admin/list', {})
      this.所有任务数据 = 结果.任务列表.map((任务) => ({
        id: 任务.id,
        名称: 任务.名称,
        表达式: 任务.表达式,
        状态: 任务.状态,
        下次执行时间: 任务.下次执行时间 !== null ? new Date(任务.下次执行时间).toLocaleString() : null,
        最后执行时间: 任务.最后执行时间 !== null ? new Date(任务.最后执行时间).toLocaleString() : null,
        执行次数: 任务.执行次数,
      }))

      await this.加载数据(this.分页组件.获得当前页码(), this.分页组件.获得每页数量())
    } catch (错误) {
      console.error('获取定时任务列表失败:', 错误)
    }
  }

  private async 显示任务详情(任务: 定时任务数据项): Promise<void> {
    // 更新 URL
    window.history.pushState(null, '', `?type=scheduled&id=${任务.id}`)

    // 创建详情内容容器
    let 详情内容 = 创建元素('div', {
      style: {
        padding: '1em',
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

    // 直接用一个请求同时获取历史日志并建立WebSocket连接
    this.api管理器
      .请求post接口并处理错误(
        '/api/job-admin/scheduled-job-admin/get-logs',
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
      })
      .catch((错误) => {
        console.error('获取定时任务日志失败:', 错误)
      })

    await 显示模态框(
      {
        标题: '定时任务详情',
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

    let 刷新按钮 = 创建元素('button', {
      textContent: '刷新',
      style: {
        padding: '6px 16px',
      },
    })
    刷新按钮.onclick = async (): Promise<void> => {
      await this.刷新任务列表()
    }
    操作区.appendChild(刷新按钮)

    // 分页监听
    this.分页组件.设置页码变化回调(async (页码): Promise<void> => {
      await this.加载数据(页码, this.分页组件.获得每页数量())
    })

    主容器.appendChild(操作区)
    主容器.appendChild(this.表格组件)
    主容器.appendChild(this.分页组件)

    this.shadow.appendChild(主容器)

    // 初始加载数据
    await this.刷新任务列表()

    // 检查 URL 参数，如果有 type=scheduled 和 id，自动显示详情
    let urlParams = new URLSearchParams(window.location.search)
    let type = urlParams.get('type')
    let id = urlParams.get('id')
    if (type === 'scheduled' && id !== null) {
      let 任务 = this.所有任务数据.find((任务) => 任务.id === id)
      if (任务 !== void 0) {
        await this.显示任务详情(任务)
      }
    }
  }
}
