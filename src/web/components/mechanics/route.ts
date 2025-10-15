import { 组件基类 } from '../../base/base'

export type 路由事件派发类型<事件名称 extends string, 事件数据> = Record<
  `LsbyRoute-发出`,
  路由事件派发对象<事件名称, 事件数据>
>
type 取事件名称<A> = A extends 路由事件派发类型<infer X, any> ? X : never
type 取事件数据<A> = A extends 路由事件派发类型<any, infer X> ? X : never

export type 路由事件监听类型<发出类型 extends 路由事件派发类型<any, any>> = Record<
  `LsbyRoute-监听`,
  路由事件监听对象<取事件名称<发出类型>, 取事件数据<发出类型>>
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
type 监听事件类型 = 路由事件派发类型<any, any> & 路由事件监听类型<any>

export class LsbyRoute extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-route', this)
  }

  private 监听表: Record<string, (a: any) => Promise<void>> = {}
  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let 插槽: HTMLSlotElement = document.createElement('slot')
    this.shadow.appendChild(插槽)

    this.监听事件('LsbyRoute-监听', async (data) => {
      this.监听表[data.detail.获得事件名称()] = data.detail.获得回调函数()
    })
    this.监听事件('LsbyRoute-发出', async (data) => {
      let 函数 = this.监听表[data.detail.获得事件名称()]
      if (函数 !== void 0) await 函数(data.detail.获得事件数据())
    })
  }
}
