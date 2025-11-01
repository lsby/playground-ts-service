import { Dialog } from '@capacitor/dialog'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试capacitor组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-capacitor', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 按钮 = 创建元素('button', {
      innerText: '点我',
      onclick: async (): Promise<void> => {
        await Dialog.alert({
          title: '提示',
          message: '你好世界',
        })
      },
    })

    this.shadow.append(按钮)
  }
}
