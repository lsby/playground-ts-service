import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'
import { 主要按钮 } from '../general/base/base-button'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示electron组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-electron-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 提示框测试 = new 主要按钮({
      文本: '提示框测试',
      点击处理函数: async (): Promise<void> => {
        await API管理器.请求postJson并处理错误('/api/demo/electron/dialog', {})
      },
    })
    this.shadow.append(提示框测试)

    let 允许焦点 = new 主要按钮({
      文本: '允许焦点',
      点击处理函数: async (): Promise<void> => {
        await API管理器.请求postJson并处理错误('/api/demo/electron/set-focus', { value: true })
      },
    })
    this.shadow.append(允许焦点)

    let 不允许焦点 = new 主要按钮({
      文本: '不允许焦点',
      点击处理函数: async (): Promise<void> => {
        await API管理器.请求postJson并处理错误('/api/demo/electron/set-focus', { value: false })
      },
    })
    this.shadow.append(不允许焦点)
  }
}
