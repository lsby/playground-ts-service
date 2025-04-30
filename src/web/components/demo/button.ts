import { 组件基类 } from '../../base/base'

type 属性类型 = { 文本: string; 回调: string }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyButton extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = ['文本', '回调']
  static {
    this.注册组件('lsby-button', this)
  }

  private 按钮 = document.createElement('button')
  constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    this.shadow.appendChild(this.按钮)
  }
  protected override async 当变化时(name: keyof 属性类型, _oldValue: string, newValue: string): Promise<void> {
    switch (name) {
      case '文本':
        this.按钮.textContent = newValue
        break
      case '回调':
        this.按钮.onclick = this.转换属性为函数('回调', ['event'])
        break
      default:
        throw new Error(`意外的属性名称: ${name}`)
    }
  }
}
