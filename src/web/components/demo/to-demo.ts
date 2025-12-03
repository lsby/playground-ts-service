import { 组件基类 } from '../../base/base'
import { 主要按钮 } from '../general/base/button'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示跳转组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-to-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 按钮 = new 主要按钮({
      文本: '进入demo页',
      点击处理函数: async (): Promise<void> => {
        window.open('/demo', '_blank')
      },
    })
    this.shadow.append(按钮)
  }
}
