import { 已审阅的any } from '../../../tools/types'
import { 组件基类 } from '../../base/base'
import { globalWebLog } from '../../global/manager/log-manager'
import { 创建元素 } from '../../global/tools/create-element'

export type 路由事件派发类型<事件名称 extends string, 事件数据> = Record<
  `lsby-route-send`,
  路由事件派发对象<事件名称, 事件数据>
>

export type 路由事件监听类型<发出类型 extends 路由事件派发类型<any, any> = 路由事件派发类型<string, any>> = Record<
  `lsby-route-listen`,
  发出类型 extends 路由事件派发类型<infer 事件名称, infer 事件数据> ? 路由事件监听对象<事件名称, 事件数据> : never
>

export class 路由事件派发对象<事件名称 extends string, 事件数据> {
  public constructor(
    private 事件名称: 事件名称,
    private 事件数据: 事件数据,
  ) {}

  public 获得事件名称(): 事件名称 {
    return this.事件名称
  }
  public 获得事件数据(): 事件数据 {
    return this.事件数据
  }
}
export class 路由事件监听对象<事件名称 extends string, 事件数据> {
  public constructor(
    private 事件名称: 事件名称,
    private 回调函数: (a: 事件数据) => Promise<void>,
  ) {}

  public 获得事件名称(): 事件名称 {
    return this.事件名称
  }
  public 获得回调函数(): (a: 事件数据) => Promise<void> {
    return this.回调函数
  }
}

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = 路由事件派发类型<string, any> & 路由事件监听类型

export class 路由组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-route', this)
  }

  private 监听表: Record<string, Array<(a: 已审阅的any) => Promise<void>>> = {}
  public constructor(属性: 属性类型) {
    super(属性)

    void globalWebLog.info('路由组件开始加载')
    this.监听冒泡事件('lsby-route-listen', async (data: CustomEvent<路由事件监听对象<string, any>>) => {
      let 事件名称 = data.detail.获得事件名称()
      await globalWebLog.debug(`路由组件注册了监听器: ${事件名称}`)
      if (this.监听表[事件名称] === void 0) {
        this.监听表[事件名称] = []
      }
      this.监听表[事件名称].push(data.detail.获得回调函数())
    })
    this.监听冒泡事件('lsby-route-send', async (data: CustomEvent<路由事件派发对象<string, any>>) => {
      let 事件名称 = data.detail.获得事件名称()
      await globalWebLog.debug(`路由组件接收到事件: ${事件名称}`)
      let 函数列表 = this.监听表[事件名称]
      if (函数列表 !== void 0) {
        await globalWebLog.debug(`路由组件找到 ${函数列表.length} 个监听器`)
        for (let 函数 of 函数列表) {
          try {
            await 函数(data.detail.获得事件数据())
            await globalWebLog.debug(`路由组件成功执行监听器回调`)
          } catch (错误) {
            await globalWebLog.error(`路由组件事件 ${事件名称} 处理失败:`, 错误)
          }
        }
      } else {
        await globalWebLog.warn(`路由组件未找到监听器: ${事件名称}`)
      }
    })
    void globalWebLog.info('路由组件加载完成')
  }

  protected override async 当加载时(): Promise<void> {
    let 插槽: HTMLSlotElement = 创建元素('slot')
    this.shadow.appendChild(插槽)
  }

  protected override async 当卸载时(): Promise<void> {
    await globalWebLog.info('路由组件开始卸载')
    this.监听表 = {}
    await globalWebLog.info('路由组件卸载完成')
  }
}
