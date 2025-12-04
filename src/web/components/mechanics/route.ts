import { 已审阅的any } from '../../../tools/types'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/tools/create-element'

export type 路由事件派发类型<事件名称 extends string, 事件数据> = Record<
  `LsbyRoute-发出`,
  路由事件派发对象<事件名称, 事件数据>
>

export type 路由事件监听类型<发出类型 extends 路由事件派发类型<any, any> = 路由事件派发类型<string, any>> = Record<
  `LsbyRoute-监听`,
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
  }

  protected override async 当加载时(): Promise<void> {
    let 插槽: HTMLSlotElement = 创建元素('slot')
    this.shadow.appendChild(插槽)

    this.监听冒泡事件('LsbyRoute-监听', async (data: CustomEvent<路由事件监听对象<string, any>>) => {
      let 事件名称 = data.detail.获得事件名称()
      if (this.监听表[事件名称] === void 0) {
        this.监听表[事件名称] = []
      }
      this.监听表[事件名称].push(data.detail.获得回调函数())
    })
    this.监听冒泡事件('LsbyRoute-发出', async (data: CustomEvent<路由事件派发对象<string, any>>) => {
      let 事件名称 = data.detail.获得事件名称()
      let 函数列表 = this.监听表[事件名称]
      if (函数列表 !== void 0) {
        for (let 函数 of 函数列表) {
          await 函数(data.detail.获得事件数据())
        }
      }
    })
  }
}
