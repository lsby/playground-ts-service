import { 路由事件监听对象, 路由事件监听类型 } from '../../abstract/route'
import { API组件基类 } from '../../base/base-api'
import { ping事件 } from './ping'

type 接口定义 = []
type 属性类型 = {}
type 发出事件类型 = {} & 路由事件监听类型<ping事件>
type 监听事件类型 = {}

export class LsbyPong extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-pong', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 结果 = document.createElement('p')
    this.shadow.append(结果)

    this.派发事件(
      'LsbyRoute-监听',
      new 路由事件监听对象('ping', async (data) => {
        结果.textContent = data.toString()
      }),
    )
  }
}
