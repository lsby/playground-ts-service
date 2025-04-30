import { API组件基类 } from '../../base/base-api'

type 接口定义 = [
  {
    path: '/api/base/add'
    method: 'post'
    input: { a: number; b: number }
    errorOutput: { status: 'fail'; data: never }
    successOutput: { status: 'success'; data: { res: number } }
  },
]
type 属性类型 = { a: string; b: string }
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

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.结果)
    this.shadow.append(this.输入框1)
    this.shadow.append(this.输入框2)

    this.结果.textContent = '计算中...'
    this.输入框1.oninput = (): void => this.设置属性('a', this.输入框1.value)
    this.输入框2.oninput = (): void => this.设置属性('b', this.输入框2.value)
  }
  protected override async 当变化时(_name: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    this.输入框1.value = this.获得属性('a')
    this.输入框2.value = this.获得属性('b')

    let 调用结果 = await this.请求接口并处理错误('/api/base/add', {
      a: this.转换属性为数字('a'),
      b: this.转换属性为数字('b'),
    })
    this.结果.textContent = 调用结果.res.toString()
  }
}
