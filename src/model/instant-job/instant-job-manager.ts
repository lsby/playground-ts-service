import { Log } from '@lsby/ts-log'
import { 即时任务上下文, 即时任务抽象类 } from './instant-job'

export class 即时任务管理器 {
  private log = new Log('即时任务管理器')
  private 任务映射表: Map<string, 即时任务抽象类<any>> = new Map()
  private 运行中任务集合: Set<string> = new Set()
  private 最大并发数: number
  private 历史记录保留天数: number
  private 清理定时器: NodeJS.Timeout | null = null

  public constructor(参数: { 最大并发数: number; 历史记录保留天数: number }) {
    let { 最大并发数, 历史记录保留天数 } = 参数
    if (最大并发数 <= 0) {
      throw new Error('最大并发数必须大于0')
    }
    if (历史记录保留天数 <= 0) {
      throw new Error('历史记录保留天数必须大于0')
    }
    this.最大并发数 = 最大并发数
    this.历史记录保留天数 = 历史记录保留天数

    // 设置定时器，每隔保留天数自动清理
    this.清理定时器 = setInterval(
      () => {
        this.清理已完成任务()
      },
      this.历史记录保留天数 * 24 * 60 * 60 * 1000,
    )
  }

  private async 尝试执行下一个任务(): Promise<void> {
    if (this.运行中任务集合.size >= this.最大并发数) {
      return
    }

    // 获取所有等待中的任务
    let 等待中任务列表: Array<即时任务抽象类<any>> = []
    let 所有任务条目 = Array.from(this.任务映射表.entries())
    for (let i = 0; i < 所有任务条目.length; i = i + 1) {
      let 条目 = 所有任务条目[i]
      if (条目 === void 0) {
        continue
      }
      let 任务 = 条目[1]
      if (任务.获得当前状态() === '等待中') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        等待中任务列表.push(任务)
      }
    }

    if (等待中任务列表.length === 0) {
      return
    }

    // 按优先级排序
    等待中任务列表.sort((a, b) => {
      let a优先级 = a.获得即时任务优先级()
      let b优先级 = b.获得即时任务优先级()

      if (a优先级 !== b优先级) {
        return b优先级 - a优先级
      }

      // 优先级相同时,按创建时间排序
      return a.获得创建时间().getTime() - b.获得创建时间().getTime()
    })

    // 执行优先级最高的任务
    let 第一个任务 = 等待中任务列表[0]
    if (第一个任务 !== void 0) {
      await this.执行任务(第一个任务.获得id())
    }
  }

  public 获得最大并发数(): number {
    return this.最大并发数
  }
  public 设置最大并发数(数量: number): void {
    if (数量 <= 0) {
      throw new Error('最大并发数必须大于0')
    }
    this.最大并发数 = 数量
  }

  public 获得历史记录保留天数(): number {
    return this.历史记录保留天数
  }
  public 设置历史记录保留天数(天数: number): void {
    if (天数 <= 0) {
      throw new Error('历史记录保留天数必须大于0')
    }
    this.历史记录保留天数 = 天数

    // 重新设置定时器
    if (this.清理定时器 !== null) {
      clearInterval(this.清理定时器)
    }
    this.清理定时器 = setInterval(
      () => {
        this.清理已完成任务()
      },
      this.历史记录保留天数 * 24 * 60 * 60 * 1000,
    )
  }

  public 提交任务<输出类型>(任务: 即时任务抽象类<输出类型>): string {
    let 任务id = 任务.获得id()
    if (this.任务映射表.has(任务id) === true) {
      throw new Error(`任务ID ${任务id} 已存在`)
    }

    this.任务映射表.set(任务id, 任务)
    任务.设置当前状态('等待中')

    // 尝试启动任务执行
    this.尝试执行下一个任务().catch(async (错误: Error) => {
      let log = this.log
      log.debug('启动任务执行失败:', 错误)
    })

    return 任务id
  }
  public async 执行任务<输出类型>(任务id: string): Promise<void> {
    let 任务 = this.任务映射表.get(任务id)
    if (任务 === void 0) {
      throw new Error(`任务ID ${任务id} 不存在`)
    }

    if (任务.获得当前状态() === '运行中') {
      throw new Error(`任务ID ${任务id} 正在运行中`)
    }

    if (任务.获得当前状态() === '已完成') {
      throw new Error(`任务ID ${任务id} 已经完成`)
    }

    try {
      任务.设置当前状态('运行中')
      任务.设置开始时间(new Date())
      this.运行中任务集合.add(任务id)

      // 执行前钩子
      await 任务.执行前钩子()

      // 创建即时任务上下文
      let 上下文: 即时任务上下文 = {
        任务id: 任务.获得id(),
        开始时间: 任务.获得开始时间() ?? new Date(),
        通知句柄: 任务.获得通知集线器(),
        输出日志: async (消息: string) => {
          await 任务.记录日志(消息)
        },
      }

      // 执行任务逻辑
      let 输出数据: 输出类型
      if (任务.获得任务超时时间() > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        输出数据 = await Promise.race([
          任务.任务逻辑(上下文),
          new Promise<输出类型>((_resolve, _reject) => {
            setTimeout(() => {
              任务.获得通知集线器().广播消息({ 类型: '超时通知' })
              任务.设置当前状态('已超时')
            }, 任务.获得任务超时时间())
          }),
        ])
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        输出数据 = await 任务.任务逻辑(上下文)
      }

      if (任务.获得当前状态() === '运行中') {
        // 执行成功钩子
        await 任务.执行成功钩子(输出数据)

        任务.设置当前状态('已完成')
        任务.设置结束时间(new Date())
        任务.设置输出结果(输出数据)
      }
    } catch (错误) {
      let 错误对象 = 错误 instanceof Error ? 错误 : new Error(String(错误))
      任务.设置错误信息(错误对象)

      // 执行失败钩子
      await 任务.执行失败钩子(错误对象)

      // 检查是否可以重试
      if (任务.可以重试() === true) {
        任务.增加重试次数()
        任务.设置当前状态('等待中')
        任务.设置开始时间(new Date())
        任务.设置结束时间(new Date())

        // 重新提交任务
        this.尝试执行下一个任务().catch(async (重试错误: Error) => {
          let log = this.log
          log.debug('重试任务失败:', 重试错误)
        })
      } else {
        任务.设置当前状态('已失败')
        任务.设置结束时间(new Date())
      }
    } finally {
      // 执行完成钩子
      await 任务.执行完成钩子()

      this.运行中任务集合.delete(任务id)

      // 尝试执行下一个任务
      this.尝试执行下一个任务().catch(async (错误: Error) => {
        let log = this.log
        log.debug('启动下一个任务失败:', 错误)
      })
    }
  }
  public 取消任务(任务id: string): boolean {
    let 任务 = this.任务映射表.get(任务id)
    if (任务 === void 0) {
      return false
    }

    let 当前状态 = 任务.获得当前状态()

    if (当前状态 === '已完成' || 当前状态 === '已失败' || 当前状态 === '已取消' || 当前状态 === '已超时') {
      return false
    }

    任务.取消任务()
    任务.设置当前状态('已取消')
    任务.设置结束时间(new Date())

    return true
  }

  public 获得所有任务列表(): Array<即时任务抽象类<any>> {
    return Array.from(this.任务映射表.values())
  }
  public 查询任务(过滤器: (任务: 即时任务抽象类<any>) => boolean): Array<即时任务抽象类<any>> {
    let 结果列表: Array<即时任务抽象类<any>> = []

    let 所有任务条目 = Array.from(this.任务映射表.entries())
    for (let i = 0; i < 所有任务条目.length; i = i + 1) {
      let 条目 = 所有任务条目[i]
      if (条目 === void 0) {
        continue
      }
      let 任务信息 = 条目[1]
      let 任务 = 任务信息

      if (过滤器(任务) === true) {
        结果列表.push(任务)
      }
    }

    return 结果列表
  }

  public 清理已完成任务(): number {
    let 清理数量 = 0

    let 当前时间 = new Date()
    let 阈值时间 = new Date(当前时间.getTime() - this.历史记录保留天数 * 24 * 60 * 60 * 1000)

    let 所有任务条目 = Array.from(this.任务映射表.entries())
    for (let i = 0; i < 所有任务条目.length; i = i + 1) {
      let 条目 = 所有任务条目[i]
      if (条目 === void 0) {
        continue
      }
      let 任务id = 条目[0]
      let 任务 = 条目[1]
      let 状态 = 任务.获得当前状态()
      if (状态 === '已完成' || 状态 === '已失败' || 状态 === '已取消' || 状态 === '已超时') {
        let 结束时间 = 任务.获得结束时间()
        if (结束时间 !== null && 结束时间 < 阈值时间) {
          this.任务映射表.delete(任务id)
          清理数量 = 清理数量 + 1
        }
      }
    }

    return 清理数量
  }
  public 清理所有任务(): void {
    // 取消所有运行中的任务
    let 所有任务条目 = Array.from(this.任务映射表.entries())
    for (let i = 0; i < 所有任务条目.length; i = i + 1) {
      let 条目 = 所有任务条目[i]
      if (条目 === void 0) {
        continue
      }
      let 任务id = 条目[0]
      let 任务 = 条目[1]
      if (任务.获得当前状态() === '运行中' || 任务.获得当前状态() === '等待中') {
        this.取消任务(任务id)
      }
    }

    this.任务映射表.clear()
    this.运行中任务集合.clear()
  }
}
