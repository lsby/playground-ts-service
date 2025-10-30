import { 自定义操作, 自定义项操作, 表格组件基类 } from '../../base/table-base'
import { API管理器 } from '../../global/api'
import { LsbyLog } from '../general/log'
import { 模态框组件 } from '../general/modal'
import { LsbyContainer } from '../layout/container'
import { LsbyRow } from '../layout/row'

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

export class 测试任务组件 extends 表格组件基类<属性类型, 发出事件类型, 监听事件类型, 任务数据项> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-job-admin', this)
  }

  private api管理器 = new API管理器()
  private 所有任务数据: 任务数据项[] = []
  private 筛选后的任务数据: 任务数据项[] = []
  private 当前页码 = 1
  private 每页数量 = 10
  private 名称筛选输入框 = document.createElement('input')
  private 创建时间筛选输入框 = document.createElement('input')
  private 详情模态框 = new 模态框组件({ 显示: '否', 标题: '任务详情' })
  private 创建测试任务模态框 = new 模态框组件({ 显示: '否', 标题: '创建测试任务' })
  private 创建失败测试任务模态框 = new 模态框组件({ 显示: '否', 标题: '创建失败测试任务' })
  private 测试任务名称输入框 = document.createElement('input')
  private 测试任务消息输入框 = document.createElement('input')
  private 测试任务持续时间输入框 = document.createElement('input')
  private 失败任务名称输入框 = document.createElement('input')
  private 失败任务消息输入框 = document.createElement('input')
  private 失败任务重试次数输入框 = document.createElement('input')
  private 失败任务延迟时间输入框 = document.createElement('input')
  private 失败任务优先级输入框 = document.createElement('input')
  private 当前任务详情WS: WebSocket | null = null

  private 应用筛选(): void {
    let 名称筛选 = this.名称筛选输入框.value.trim().toLowerCase()
    let 创建时间筛选 = this.创建时间筛选输入框.value.trim()

    this.筛选后的任务数据 = this.所有任务数据.filter((任务) => {
      let 名称匹配 = 名称筛选 === '' || 任务.名称.toLowerCase().includes(名称筛选)
      let 时间匹配 = 创建时间筛选 === '' || 任务.创建时间.includes(创建时间筛选)
      return 名称匹配 && 时间匹配
    })
  }

  protected override async 获得列排序(): Promise<(keyof 任务数据项)[]> {
    return ['名称', '状态', '优先级', '创建时间', '执行时长', '重试次数']
  }

  protected override 映射显示字段名称(数据字段: keyof 任务数据项): string | null {
    switch (数据字段) {
      case '名称':
        return '任务名称'
      case '状态':
        return '状态'
      case '优先级':
        return '优先级'
      case '创建时间':
        return '创建时间'
      case '执行时长':
        return '执行时长(ms)'
      case '重试次数':
        return '重试次数'
      default:
        return null
    }
  }
  protected override 映射显示字段值(数据字段: keyof 任务数据项, 值: 任务数据项[keyof 任务数据项]): string {
    return String(值)
  }

  protected override async 请求数据(page: number, size: number): Promise<{ data: 任务数据项[]; total: number }> {
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
      创建测试任务: async (): Promise<void> => {
        this.创建测试任务模态框.设置属性('显示', '是')
      },
      创建失败测试任务: async (): Promise<void> => {
        this.创建失败测试任务模态框.设置属性('显示', '是')
      },
    }
  }

  protected override async 获得自定义项操作(): Promise<自定义项操作<任务数据项>> {
    return {
      详情: async (任务: 任务数据项): Promise<void> => {
        this.显示任务详情(任务)
      },
    }
  }

  private async 刷新任务列表(): Promise<void> {
    try {
      let 结果 = await this.api管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/list', {})
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

      this.应用筛选()
      await this.加载数据(this.当前页码, this.每页数量)
    } catch (错误) {
      console.error('获取任务列表失败:', 错误)
    }
  }

  private 显示任务详情(任务: 任务数据项): void {
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
      })
      .catch((错误) => {
        console.error('获取任务日志失败:', 错误)
      })

    this.详情模态框.设置内容(详情内容)
    this.详情模态框.设置属性('显示', '是')
  }

  private 设置创建测试任务模态框内容(): void {
    let 内容容器 = document.createElement('div')
    内容容器.style.padding = '1em'
    内容容器.style.display = 'flex'
    内容容器.style.flexDirection = 'column'
    内容容器.style.gap = '1em'

    // 任务名称输入
    let 名称容器 = document.createElement('div')
    let 名称标签 = document.createElement('label')
    名称标签.textContent = '任务名称:'
    名称标签.style.display = 'block'
    名称标签.style.marginBottom = '0.5em'
    this.测试任务名称输入框.placeholder = '输入测试任务名称'
    this.测试任务名称输入框.style.width = '100%'
    this.测试任务名称输入框.style.padding = '0.5em'
    this.测试任务名称输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务名称输入框.style.borderRadius = '4px'
    this.测试任务名称输入框.value = '测试任务_' + new Date().toLocaleTimeString()
    名称容器.append(名称标签, this.测试任务名称输入框)

    // 打印消息输入
    let 消息容器 = document.createElement('div')
    let 消息标签 = document.createElement('label')
    消息标签.textContent = '打印消息:'
    消息标签.style.display = 'block'
    消息标签.style.marginBottom = '0.5em'
    this.测试任务消息输入框.placeholder = '每秒打印的消息内容'
    this.测试任务消息输入框.style.width = '100%'
    this.测试任务消息输入框.style.padding = '0.5em'
    this.测试任务消息输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务消息输入框.style.borderRadius = '4px'
    this.测试任务消息输入框.value = '测试消息'
    消息容器.append(消息标签, this.测试任务消息输入框)

    // 持续时间输入
    let 时间容器 = document.createElement('div')
    let 时间标签 = document.createElement('label')
    时间标签.textContent = '持续时间(秒):'
    时间标签.style.display = 'block'
    时间标签.style.marginBottom = '0.5em'
    this.测试任务持续时间输入框.placeholder = '任务持续时间，默认60秒'
    this.测试任务持续时间输入框.type = 'number'
    this.测试任务持续时间输入框.style.width = '100%'
    this.测试任务持续时间输入框.style.padding = '0.5em'
    this.测试任务持续时间输入框.style.border = '1px solid var(--边框颜色)'
    this.测试任务持续时间输入框.style.borderRadius = '4px'
    this.测试任务持续时间输入框.value = '60'
    时间容器.append(时间标签, this.测试任务持续时间输入框)

    // 按钮容器
    let 按钮容器 = document.createElement('div')
    按钮容器.style.display = 'flex'
    按钮容器.style.gap = '0.5em'
    按钮容器.style.justifyContent = 'flex-end'

    let 取消按钮 = document.createElement('button')
    取消按钮.textContent = '取消'
    取消按钮.style.padding = '0.5em 1em'
    取消按钮.style.border = '1px solid var(--边框颜色)'
    取消按钮.style.borderRadius = '4px'
    取消按钮.style.backgroundColor = 'var(--背景颜色)'
    取消按钮.style.color = 'var(--文字颜色)'
    取消按钮.style.cursor = 'pointer'

    let 确认按钮 = document.createElement('button')
    确认按钮.textContent = '创建任务'
    确认按钮.style.padding = '0.5em 1em'
    确认按钮.style.border = 'none'
    确认按钮.style.borderRadius = '4px'
    确认按钮.style.backgroundColor = 'var(--强调按钮背景)'
    确认按钮.style.color = 'var(--强调按钮文字)'
    确认按钮.style.cursor = 'pointer'

    按钮容器.append(取消按钮, 确认按钮)

    // 事件绑定
    取消按钮.onclick = (): void => {
      this.创建测试任务模态框.设置属性('显示', '否')
    }

    确认按钮.onclick = async (): Promise<void> => {
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
        await this.api管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/create-test', {
          测试任务名称: 任务名称,
          测试任务消息: 消息内容,
          测试任务持续时间: 持续时间,
          任务优先级: 1,
        })

        this.创建测试任务模态框.设置属性('显示', '否')

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
    }

    内容容器.append(名称容器, 消息容器, 时间容器, 按钮容器)
    this.创建测试任务模态框.设置内容(内容容器)
  }

  private 设置创建失败测试任务模态框内容(): void {
    let 内容容器 = document.createElement('div')
    内容容器.style.padding = '1em'
    内容容器.style.display = 'flex'
    内容容器.style.flexDirection = 'column'
    内容容器.style.gap = '1em'

    // 任务名称输入
    let 名称容器 = document.createElement('div')
    let 名称标签 = document.createElement('label')
    名称标签.textContent = '任务名称:'
    名称标签.style.display = 'block'
    名称标签.style.marginBottom = '0.5em'
    this.失败任务名称输入框.placeholder = '输入失败测试任务名称'
    this.失败任务名称输入框.style.width = '100%'
    this.失败任务名称输入框.style.padding = '0.5em'
    this.失败任务名称输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务名称输入框.style.borderRadius = '4px'
    this.失败任务名称输入框.value = '失败测试任务_' + new Date().toLocaleTimeString()
    名称容器.append(名称标签, this.失败任务名称输入框)

    // 失败消息输入
    let 消息容器 = document.createElement('div')
    let 消息标签 = document.createElement('label')
    消息标签.textContent = '失败消息:'
    消息标签.style.display = 'block'
    消息标签.style.marginBottom = '0.5em'
    this.失败任务消息输入框.placeholder = '任务失败时显示的消息'
    this.失败任务消息输入框.style.width = '100%'
    this.失败任务消息输入框.style.padding = '0.5em'
    this.失败任务消息输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务消息输入框.style.borderRadius = '4px'
    this.失败任务消息输入框.value = '这是一个必然失败的任务，用于测试重试机制'
    消息容器.append(消息标签, this.失败任务消息输入框)

    // 最大重试次数输入
    let 重试容器 = document.createElement('div')
    let 重试标签 = document.createElement('label')
    重试标签.textContent = '最大重试次数:'
    重试标签.style.display = 'block'
    重试标签.style.marginBottom = '0.5em'
    this.失败任务重试次数输入框.placeholder = '任务失败后的最大重试次数'
    this.失败任务重试次数输入框.type = 'number'
    this.失败任务重试次数输入框.style.width = '100%'
    this.失败任务重试次数输入框.style.padding = '0.5em'
    this.失败任务重试次数输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务重试次数输入框.style.borderRadius = '4px'
    this.失败任务重试次数输入框.value = '3'
    重试容器.append(重试标签, this.失败任务重试次数输入框)

    // 失败延迟时间输入
    let 延迟容器 = document.createElement('div')
    let 延迟标签 = document.createElement('label')
    延迟标签.textContent = '失败延迟时间(毫秒):'
    延迟标签.style.display = 'block'
    延迟标签.style.marginBottom = '0.5em'
    this.失败任务延迟时间输入框.placeholder = '可选，延迟多少毫秒后失败，默认立即失败'
    this.失败任务延迟时间输入框.type = 'number'
    this.失败任务延迟时间输入框.style.width = '100%'
    this.失败任务延迟时间输入框.style.padding = '0.5em'
    this.失败任务延迟时间输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务延迟时间输入框.style.borderRadius = '4px'
    this.失败任务延迟时间输入框.value = ''
    延迟容器.append(延迟标签, this.失败任务延迟时间输入框)

    // 任务优先级输入
    let 优先级容器 = document.createElement('div')
    let 优先级标签 = document.createElement('label')
    优先级标签.textContent = '任务优先级:'
    优先级标签.style.display = 'block'
    优先级标签.style.marginBottom = '0.5em'
    this.失败任务优先级输入框.placeholder = '任务优先级，数字越大优先级越高'
    this.失败任务优先级输入框.type = 'number'
    this.失败任务优先级输入框.style.width = '100%'
    this.失败任务优先级输入框.style.padding = '0.5em'
    this.失败任务优先级输入框.style.border = '1px solid var(--边框颜色)'
    this.失败任务优先级输入框.style.borderRadius = '4px'
    this.失败任务优先级输入框.value = '1'
    优先级容器.append(优先级标签, this.失败任务优先级输入框)

    // 按钮容器
    let 按钮容器 = document.createElement('div')
    按钮容器.style.display = 'flex'
    按钮容器.style.gap = '0.5em'
    按钮容器.style.justifyContent = 'flex-end'

    let 取消按钮 = document.createElement('button')
    取消按钮.textContent = '取消'
    取消按钮.style.padding = '0.5em 1em'
    取消按钮.style.border = '1px solid var(--边框颜色)'
    取消按钮.style.borderRadius = '4px'
    取消按钮.style.backgroundColor = 'var(--背景颜色)'
    取消按钮.style.color = 'var(--文字颜色)'
    取消按钮.style.cursor = 'pointer'

    let 确认按钮 = document.createElement('button')
    确认按钮.textContent = '创建任务'
    确认按钮.style.padding = '0.5em 1em'
    确认按钮.style.border = 'none'
    确认按钮.style.borderRadius = '4px'
    确认按钮.style.backgroundColor = 'var(--强调按钮背景)'
    确认按钮.style.color = 'var(--强调按钮文字)'
    确认按钮.style.cursor = 'pointer'

    按钮容器.append(取消按钮, 确认按钮)

    // 事件绑定
    取消按钮.onclick = (): void => {
      this.创建失败测试任务模态框.设置属性('显示', '否')
    }

    确认按钮.onclick = async (): Promise<void> => {
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
        await this.api管理器.请求post接口并处理错误('/api/job-admin/instant-job-admin/create-fail-test', {
          失败任务名称: 任务名称,
          失败消息: 失败消息,
          最大重试次数: 最大重试次数,
          任务优先级: 任务优先级,
          ...(失败延迟时间 !== '' ? { 失败延迟时间: parseInt(失败延迟时间) } : {}),
        })

        this.创建失败测试任务模态框.设置属性('显示', '否')

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
    }

    内容容器.append(名称容器, 消息容器, 重试容器, 延迟容器, 优先级容器, 按钮容器)
    this.创建失败测试任务模态框.设置内容(内容容器)
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

    // 创建时间筛选
    let 时间筛选行 = new LsbyRow({})
    let 时间筛选标签 = document.createElement('label')
    时间筛选标签.textContent = '创建时间:'
    时间筛选标签.style.minWidth = '100px'
    this.创建时间筛选输入框.placeholder = '输入创建时间关键词 (如: 2024)'
    this.创建时间筛选输入框.style.flex = '1'
    this.创建时间筛选输入框.style.padding = '0.5em'
    this.创建时间筛选输入框.style.border = '1px solid var(--边框颜色)'
    this.创建时间筛选输入框.style.borderRadius = '4px'
    时间筛选行.append(时间筛选标签, this.创建时间筛选输入框)

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

    筛选容器.append(筛选标题, 名称筛选行, 时间筛选行, 筛选按钮行)

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
    this.创建时间筛选输入框.oninput = (): void => {
      this.应用筛选()
      this.加载数据(1, this.每页数量).catch(console.error)
    }

    // 添加模态框到页面
    document.body.appendChild(this.详情模态框)
    document.body.appendChild(this.创建测试任务模态框)
    document.body.appendChild(this.创建失败测试任务模态框)

    // 设置创建测试任务模态框内容
    this.设置创建测试任务模态框内容()

    // 设置创建失败测试任务模态框内容
    this.设置创建失败测试任务模态框内容()

    // 监听详情模态框关闭事件
    this.详情模态框.addEventListener('关闭', () => {
      if (this.当前任务详情WS !== null) {
        this.当前任务详情WS.close()
        this.当前任务详情WS = null
      }
    })

    // 初始加载数据
    await this.刷新任务列表()
  }
}
