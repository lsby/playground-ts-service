import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { API管理器类 } from '../../global/class/api'
import { 创建元素 } from '../../global/create-element'
import { 关闭模态框, 显示模态框 } from '../../global/modal'
import { LsbyDataTable, 数据表加载数据参数 } from '../general/data-table'
import { LsbyLog } from '../general/log'

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
  private 测试任务名称输入框 = 创建元素('input')
  private 测试任务消息输入框 = 创建元素('input')
  private 测试任务持续时间输入框 = 创建元素('input')
  private 失败任务名称输入框 = 创建元素('input')
  private 失败任务消息输入框 = 创建元素('input')
  private 失败任务重试次数输入框 = 创建元素('input')
  private 失败任务延迟时间输入框 = 创建元素('input')
  private 失败任务优先级输入框 = 创建元素('input')
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

  private async 显示创建测试任务模态框(): Promise<void> {
    let 内容容器 = 创建元素('div', {
      style: {
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
      },
    })

    // 任务名称输入
    let 名称容器 = 创建元素('div')
    let 名称标签 = 创建元素('label', {
      textContent: '任务名称:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.测试任务名称输入框.placeholder = '输入测试任务名称'
    this.测试任务名称输入框.style.width = '100%'
    this.测试任务名称输入框.style.padding = '0.5em'
    this.测试任务名称输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务名称输入框.style.borderRadius = '4px'
    this.测试任务名称输入框.value = '测试任务_' + new Date().toLocaleTimeString()
    名称容器.append(名称标签, this.测试任务名称输入框)

    // 打印消息输入
    let 消息容器 = 创建元素('div')
    let 消息标签 = 创建元素('label', {
      textContent: '打印消息:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.测试任务消息输入框.placeholder = '每秒打印的消息内容'
    this.测试任务消息输入框.style.width = '100%'
    this.测试任务消息输入框.style.padding = '0.5em'
    this.测试任务消息输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务消息输入框.style.borderRadius = '4px'
    this.测试任务消息输入框.value = '测试消息'
    消息容器.append(消息标签, this.测试任务消息输入框)

    // 持续时间输入
    let 时间容器 = 创建元素('div')
    let 时间标签 = 创建元素('label', {
      textContent: '持续时间(秒):',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.测试任务持续时间输入框.placeholder = '任务持续时间，默认60秒'
    this.测试任务持续时间输入框.type = 'number'
    this.测试任务持续时间输入框.style.width = '100%'
    this.测试任务持续时间输入框.style.padding = '0.5em'
    this.测试任务持续时间输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务持续时间输入框.style.borderRadius = '4px'
    this.测试任务持续时间输入框.value = '60'
    时间容器.append(时间标签, this.测试任务持续时间输入框)

    // 按钮容器
    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        gap: '0.5em',
        justifyContent: 'flex-end',
      },
    })

    let 取消按钮 = 创建元素('button', {
      textContent: '取消',
      style: {
        padding: '0.5em 1em',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        backgroundColor: 'var(--背景颜色)',
        color: 'var(--文字颜色)',
        cursor: 'pointer',
      },
      onclick: async (): Promise<void> => {
        await 关闭模态框()
      },
    })

    let 确认按钮 = 创建元素('button', {
      textContent: '创建任务',
      style: {
        padding: '0.5em 1em',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'var(--强调按钮背景)',
        color: 'var(--强调按钮文字)',
        cursor: 'pointer',
      },
      onclick: async (): Promise<void> => {
        let 任务名称 = this.测试任务名称输入框.value.trim()
        let 消息内容 = this.测试任务消息输入框.value.trim()
        let 持续时间 = parseInt(this.测试任务持续时间输入框.value)
        if (isNaN(持续时间) || 持续时间 <= 0) {
          持续时间 = 60
        }

        if (任务名称 === '') {
          alert('请输入任务名称')
          return
        }

        if (消息内容 === '') {
          alert('请输入打印消息')
          return
        }

        try {
          await API管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/create-test', {
            测试任务名称: 任务名称,
            测试任务消息: 消息内容,
            测试任务持续时间: 持续时间,
            任务优先级: 1,
          })

          await 关闭模态框()

          // 清空表单
          this.测试任务名称输入框.value = '测试任务_' + new Date().toLocaleTimeString()
          this.测试任务消息输入框.value = '测试消息'
          this.测试任务持续时间输入框.value = '60'

          // 刷新列表
          await this.刷新任务列表()
        } catch (错误) {
          console.error('创建测试任务失败:', 错误)
          alert('创建测试任务失败，请查看控制台')
        }
      },
    })

    按钮容器.append(取消按钮, 确认按钮)

    内容容器.append(名称容器, 消息容器, 时间容器, 按钮容器)
    await 显示模态框({ 标题: '创建测试任务' }, 内容容器)
  }

  private async 显示创建失败测试任务模态框(): Promise<void> {
    let 内容容器 = 创建元素('div', {
      style: {
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
      },
    })

    // 任务名称输入
    let 名称容器 = 创建元素('div')
    let 名称标签 = 创建元素('label', {
      textContent: '任务名称:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.失败任务名称输入框.placeholder = '输入失败测试任务名称'
    this.失败任务名称输入框.style.width = '100%'
    this.失败任务名称输入框.style.padding = '0.5em'
    this.失败任务名称输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务名称输入框.style.borderRadius = '4px'
    this.失败任务名称输入框.value = '失败测试任务_' + new Date().toLocaleTimeString()
    名称容器.append(名称标签, this.失败任务名称输入框)

    // 失败消息输入
    let 消息容器 = 创建元素('div')
    let 消息标签 = 创建元素('label', {
      textContent: '失败消息:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.失败任务消息输入框.placeholder = '任务失败时显示的消息'
    this.失败任务消息输入框.style.width = '100%'
    this.失败任务消息输入框.style.padding = '0.5em'
    this.失败任务消息输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务消息输入框.style.borderRadius = '4px'
    this.失败任务消息输入框.value = '这是一个必然失败的任务，用于测试重试机制'
    消息容器.append(消息标签, this.失败任务消息输入框)

    // 最大重试次数输入
    let 重试容器 = 创建元素('div')
    let 重试标签 = 创建元素('label', {
      textContent: '最大重试次数:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.失败任务重试次数输入框.placeholder = '任务失败后的最大重试次数'
    this.失败任务重试次数输入框.type = 'number'
    this.失败任务重试次数输入框.style.width = '100%'
    this.失败任务重试次数输入框.style.padding = '0.5em'
    this.失败任务重试次数输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务重试次数输入框.style.borderRadius = '4px'
    this.失败任务重试次数输入框.value = '3'
    重试容器.append(重试标签, this.失败任务重试次数输入框)

    // 失败延迟时间输入
    let 延迟容器 = 创建元素('div')
    let 延迟标签 = 创建元素('label', {
      textContent: '失败延迟时间(毫秒):',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.失败任务延迟时间输入框.placeholder = '可选，延迟多少毫秒后失败，默认立即失败'
    this.失败任务延迟时间输入框.type = 'number'
    this.失败任务延迟时间输入框.style.width = '100%'
    this.失败任务延迟时间输入框.style.padding = '0.5em'
    this.失败任务延迟时间输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务延迟时间输入框.style.borderRadius = '4px'
    this.失败任务延迟时间输入框.value = ''
    延迟容器.append(延迟标签, this.失败任务延迟时间输入框)

    // 任务优先级输入
    let 优先级容器 = 创建元素('div')
    let 优先级标签 = 创建元素('label', {
      textContent: '任务优先级:',
      style: {
        display: 'block',
        marginBottom: '0.5em',
      },
    })
    this.失败任务优先级输入框.placeholder = '任务优先级，数字越大优先级越高'
    this.失败任务优先级输入框.type = 'number'
    this.失败任务优先级输入框.style.width = '100%'
    this.失败任务优先级输入框.style.padding = '0.5em'
    this.失败任务优先级输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务优先级输入框.style.borderRadius = '4px'
    this.失败任务优先级输入框.value = '1'
    优先级容器.append(优先级标签, this.失败任务优先级输入框)

    // 按钮容器
    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        gap: '0.5em',
        justifyContent: 'flex-end',
      },
    })

    let 取消按钮 = 创建元素('button', {
      textContent: '取消',
      style: {
        padding: '0.5em 1em',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        backgroundColor: 'var(--背景颜色)',
        color: 'var(--文字颜色)',
        cursor: 'pointer',
      },
      onclick: async (): Promise<void> => {
        await 关闭模态框()
      },
    })

    let 确认按钮 = 创建元素('button', {
      textContent: '创建任务',
      style: {
        padding: '0.5em 1em',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'var(--强调按钮背景)',
        color: 'var(--强调按钮文字)',
        cursor: 'pointer',
      },
      onclick: async (): Promise<void> => {
        let 任务名称 = this.失败任务名称输入框.value.trim()
        let 失败消息 = this.失败任务消息输入框.value.trim()
        let 最大重试次数 = parseInt(this.失败任务重试次数输入框.value)
        let 失败延迟时间 = this.失败任务延迟时间输入框.value.trim()
        let 任务优先级 = parseInt(this.失败任务优先级输入框.value)

        if (isNaN(最大重试次数) || 最大重试次数 < 0) {
          alert('请输入有效的最大重试次数')
          return
        }

        if (任务名称 === '') {
          alert('请输入任务名称')
          return
        }

        if (失败消息 === '') {
          alert('请输入失败消息')
          return
        }

        if (isNaN(任务优先级) || 任务优先级 < 0) {
          任务优先级 = 1
        }

        try {
          await API管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/create-fail-test', {
            失败任务名称: 任务名称,
            失败消息: 失败消息,
            最大重试次数: 最大重试次数,
            任务优先级: 任务优先级,
            ...(失败延迟时间 !== '' ? { 失败延迟时间: parseInt(失败延迟时间) } : {}),
          })

          await 关闭模态框()

          // 清空表单
          this.失败任务名称输入框.value = '失败测试任务_' + new Date().toLocaleTimeString()
          this.失败任务消息输入框.value = '这是一个必然失败的任务，用于测试重试机制'
          this.失败任务重试次数输入框.value = '3'
          this.失败任务延迟时间输入框.value = ''
          this.失败任务优先级输入框.value = '1'

          // 刷新列表
          await this.刷新任务列表()
        } catch (错误) {
          console.error('创建失败测试任务失败:', 错误)
          alert('创建失败测试任务失败，请查看控制台')
        }
      },
    })

    按钮容器.append(取消按钮, 确认按钮)

    内容容器.append(名称容器, 消息容器, 重试容器, 延迟容器, 优先级容器, 按钮容器)
    await 显示模态框({ 标题: '创建失败测试任务' }, 内容容器)
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
      onclick: async (): Promise<void> => {
        await this.刷新任务列表()
      },
    })

    let 创建测试任务按钮 = 创建元素('button', {
      textContent: '创建测试任务',
      style: {
        padding: '6px 16px',
      },
      onclick: async (): Promise<void> => {
        await this.显示创建测试任务模态框()
      },
    })

    let 创建失败测试任务按钮 = 创建元素('button', {
      textContent: '创建失败测试任务',
      style: {
        padding: '6px 16px',
      },
      onclick: async (): Promise<void> => {
        await this.显示创建失败测试任务模态框()
      },
    })

    操作区.appendChild(刷新按钮)
    操作区.appendChild(创建测试任务按钮)
    操作区.appendChild(创建失败测试任务按钮)

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
