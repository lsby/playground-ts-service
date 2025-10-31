import { 自定义操作, 自定义项操作, 表格组件基类 } from '../../base/table-base'
import { API管理器 } from '../../global/api-manager'
import { API管理器类 } from '../../global/class/api'
import { 显示模态框 } from '../../global/modal'
import { LsbyLog } from '../general/log'
import { LsbyContainer } from '../layout/container'
import { LsbyRow } from '../layout/row'

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

export class 定时任务组件 extends 表格组件基类<属性类型, 发出事件类型, 监听事件类型, 定时任务数据项> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-scheduled-job', this)
  }

  private api管理器 = new API管理器类()
  private 所有任务数据: 定时任务数据项[] = []
  private 筛选后的任务数据: 定时任务数据项[] = []
  private 当前页码 = 1
  private 每页数量 = 10
  private 名称筛选输入框 = document.createElement('input')
  private 表达式筛选输入框 = document.createElement('input')
  private 当前任务详情WS: WebSocket | null = null

  private 应用筛选(): void {
    let 名称筛选 = this.名称筛选输入框.value.trim().toLowerCase()
    let 表达式筛选 = this.表达式筛选输入框.value.trim().toLowerCase()

    this.筛选后的任务数据 = this.所有任务数据.filter((任务) => {
      let 名称匹配 = 名称筛选 === '' || 任务.名称.toLowerCase().includes(名称筛选)
      let 表达式匹配 = 表达式筛选 === '' || 任务.表达式.toLowerCase().includes(表达式筛选)
      return 名称匹配 && 表达式匹配
    })
  }

  protected override async 获得列排序(): Promise<(keyof 定时任务数据项)[]> {
    return ['名称', '表达式', '状态', '下次执行时间', '最后执行时间', '执行次数']
  }

  protected override 映射显示字段名称(数据字段: keyof 定时任务数据项): string | null {
    switch (数据字段) {
      case '名称':
        return '任务名称'
      case '表达式':
        return 'Cron 表达式'
      case '状态':
        return '状态'
      case '下次执行时间':
        return '下次执行时间'
      case '最后执行时间':
        return '最后执行时间'
      case '执行次数':
        return '执行次数'
      default:
        return null
    }
  }
  protected override 映射显示字段值(数据字段: keyof 定时任务数据项, 值: 定时任务数据项[keyof 定时任务数据项]): string {
    return String(值)
  }

  protected override async 请求数据(page: number, size: number): Promise<{ data: 定时任务数据项[]; total: number }> {
    this.当前页码 = page
    this.每页数量 = size

    this.应用筛选()

    let 开始索引 = (page - 1) * size
    let 结束索引 = 开始索引 + size
    let 分页数据 = this.筛选后的任务数据.slice(开始索引, 结束索引)

    return {
      data: 分页数据,
      total: this.筛选后的任务数据.length,
    }
  }

  protected override async 获得自定义操作(): Promise<自定义操作> {
    return {
      刷新: async (): Promise<void> => {
        await this.刷新任务列表()
      },
    }
  }

  protected override async 获得自定义项操作(): Promise<自定义项操作<定时任务数据项>> {
    return {
      详情: async (任务: 定时任务数据项): Promise<void> => {
        await this.显示任务详情(任务)
      },
      手动触发: async (任务: 定时任务数据项): Promise<void> => {
        try {
          await API管理器.请求post接口并处理错误('/api/job-admin/scheduled-job-admin/manual-trigger', {
            任务id: 任务.id,
          })
          await this.刷新任务列表()
        } catch (错误) {
          console.error('手动触发任务失败:', 错误)
        }
      },
    }
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

      this.应用筛选()
      await this.加载数据(this.当前页码, this.每页数量)
    } catch (错误) {
      console.error('获取定时任务列表失败:', 错误)
    }
  }

  private async 显示任务详情(任务: 定时任务数据项): Promise<void> {
    // 更新 URL
    window.history.pushState(null, '', `?type=scheduled&id=${任务.id}`)

    // 创建详情内容容器
    let 详情内容 = document.createElement('div')
    详情内容.style.padding = '1em'

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

    // 创建筛选区域
    let 筛选容器 = new LsbyContainer({})
    筛选容器.style.border = '1px solid var(--边框颜色)'
    筛选容器.style.borderRadius = '8px'
    筛选容器.style.padding = '1em'
    筛选容器.style.marginBottom = '1em'

    let 筛选标题 = document.createElement('h4')
    筛选标题.textContent = '筛选条件'
    筛选标题.style.marginTop = '0'

    // 名称筛选
    let 名称筛选行 = new LsbyRow({})
    let 名称筛选标签 = document.createElement('label')
    名称筛选标签.textContent = '任务名称:'
    名称筛选标签.style.minWidth = '100px'
    this.名称筛选输入框.placeholder = '输入任务名称关键词'
    this.名称筛选输入框.style.flex = '1'
    this.名称筛选输入框.style.padding = '0.5em'
    this.名称筛选输入框.style.border = '1px solid var(--边框颜色)'
    this.名称筛选输入框.style.borderRadius = '4px'
    名称筛选行.append(名称筛选标签, this.名称筛选输入框)

    // 表达式筛选
    let 表达式筛选行 = new LsbyRow({})
    let 表达式筛选标签 = document.createElement('label')
    表达式筛选标签.textContent = 'Cron 表达式:'
    表达式筛选标签.style.minWidth = '100px'
    this.表达式筛选输入框.placeholder = '输入 Cron 表达式关键词'
    this.表达式筛选输入框.style.flex = '1'
    this.表达式筛选输入框.style.padding = '0.5em'
    this.表达式筛选输入框.style.border = '1px solid var(--边框颜色)'
    this.表达式筛选输入框.style.borderRadius = '4px'
    表达式筛选行.append(表达式筛选标签, this.表达式筛选输入框)

    // 筛选按钮
    let 筛选按钮行 = new LsbyRow({})
    let 筛选按钮 = document.createElement('button')
    筛选按钮.textContent = '应用筛选'
    筛选按钮.style.padding = '0.5em 1em'
    筛选按钮.style.border = 'none'
    筛选按钮.style.borderRadius = '4px'
    筛选按钮.style.backgroundColor = 'var(--按钮背景)'
    筛选按钮.style.color = 'var(--按钮文字)'
    筛选按钮.style.cursor = 'pointer'
    筛选按钮.onclick = (): void => {
      this.应用筛选()
      this.加载数据(1, this.每页数量).catch(console.error)
    }
    筛选按钮行.append(筛选按钮)

    筛选容器.append(筛选标题, 名称筛选行, 表达式筛选行, 筛选按钮行)

    // 主容器
    let 主容器 = document.createElement('div')
    主容器.style.display = 'flex'
    主容器.style.flexDirection = 'column'
    主容器.style.gap = '1em'

    主容器.appendChild(筛选容器)

    // 绑定筛选事件
    this.名称筛选输入框.oninput = (): void => {
      this.应用筛选()
      this.加载数据(1, this.每页数量).catch(console.error)
    }
    this.表达式筛选输入框.oninput = (): void => {
      this.应用筛选()
      this.加载数据(1, this.每页数量).catch(console.error)
    }

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
