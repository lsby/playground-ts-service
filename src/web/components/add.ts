import { API组件基类 } from '../base/base-api'

type 接口定义 = {
  加法接口: {
    path: '/api/base/add'
    method: 'post'
    input: { a: number; b: number }
    errorOutput: { status: 'fail'; data: never }
    successOutput: { status: 'success'; data: { res: number } }
  }
}
type 接口属性 = { [接口名称 in keyof 接口定义]: 接口定义[接口名称]['path'] }
type 属性类型 = 接口属性 & { a: string; b: string }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyAdd extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = ['a', 'b']
  static {
    this.注册组件('lsby-add', this)
  }

  private 结果 = document.createElement('p')
  private 输入框1 = document.createElement('input')
  private 输入框2 = document.createElement('input')
  private 输入框1改变 = (): void => this.设置属性('a', this.输入框1.value)
  private 输入框2改变 = (): void => this.设置属性('b', this.输入框2.value)

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.结果)
    this.shadow.append(this.输入框1)
    this.shadow.append(this.输入框2)

    this.结果.textContent = '计算中...'
    this.输入框1.addEventListener('input', this.输入框1改变)
    this.输入框2.addEventListener('input', this.输入框2改变)
  }
  protected override async 当卸载时(): Promise<void> {
    this.输入框1.removeEventListener('input', this.输入框1改变)
    this.输入框2.removeEventListener('input', this.输入框2改变)
  }
  protected override async 当变化时(name: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    if (name === '加法接口') return

    this.输入框1.value = this.获得属性('a')
    this.输入框2.value = this.获得属性('b')

    let 调用结果 = await this.请求接口('加法接口', 'post', {
      a: this.转换属性为数字('a'),
      b: this.转换属性为数字('b'),
    })
    if (调用结果.status === 'fail') this.结果.textContent = '调用失败'
    this.结果.textContent = 调用结果.data.res.toString()
  }
}
