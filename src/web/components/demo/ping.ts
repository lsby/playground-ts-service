import { 路由事件派发对象, 路由事件派发类型 } from '../../abstract/route'
import { API组件基类 } from '../../base/base-api'

export type ping事件 = 路由事件派发类型<'ping', number>
type 接口定义 = []
type 属性类型 = {}
type 发出事件类型 = {} & ping事件
type 监听事件类型 = {}

export class LsbyPing extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-ping', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 按钮 = document.createElement('button')
    this.shadow.append(按钮)

    按钮.textContent = '开始测试'
    按钮.onclick = async (): Promise<void> => {
      this.派发事件('LsbyRoute-发出', new 路由事件派发对象('ping', Math.random()))
    }
  }
}
