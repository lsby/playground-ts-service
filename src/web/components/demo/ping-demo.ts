import { 组件基类 } from '../../base/base'
import { 主要按钮 } from '../general/base/base-button'
import { 路由事件派发对象, 路由事件派发类型 } from '../mechanics/route'

export type ping事件演示 = 路由事件派发类型<'ping', number>
type 属性类型 = {}
type 发出事件类型 = {} & ping事件演示
type 监听事件类型 = {}

export class 演示ping组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-ping-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 按钮 = new 主要按钮({
      文本: '开始测试',
      点击处理函数: async (): Promise<void> => {
        this.派发事件('lsby-route-send', new 路由事件派发对象('ping', Math.random()))
      },
    })
    this.shadow.append(按钮)
  }
}
