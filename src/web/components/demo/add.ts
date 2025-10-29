import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'
import { LsbyContainer } from '../layout/container'

type 属性类型 = { a: string; b: string }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试加法组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['a', 'b']

  static {
    this.注册组件('lsby-demo-add', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  private 结果 = document.createElement('p')
  private 输入框1 = document.createElement('input')
  private 输入框2 = document.createElement('input')

  protected override async 当加载时(): Promise<void> {
    let 输入框1容器 = new LsbyContainer({})
    输入框1容器.style.height = 'auto'
    输入框1容器.append(this.输入框1)

    let 输入框2容器 = new LsbyContainer({})
    输入框2容器.style.height = 'auto'
    输入框2容器.append(this.输入框2)

    let 结果容器 = new LsbyContainer({})
    结果容器.style.height = 'auto'
    结果容器.append(this.结果)

    this.shadow.append(输入框1容器)
    this.shadow.append(输入框2容器)
    this.shadow.append(结果容器)

    this.结果.textContent = '计算中...'
    this.输入框1.oninput = (): void => this.设置属性('a', this.输入框1.value)
    this.输入框2.oninput = (): void => this.设置属性('b', this.输入框2.value)
  }
  protected override async 当变化时(_name: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    this.输入框1.value = this.获得属性('a') ?? '0'
    this.输入框2.value = this.获得属性('b') ?? '0'

    let 调用结果 = await this.API管理器.请求post接口并处理错误('/api/demo/base/add', {
      a: parseInt(this.输入框1.value),
      b: parseInt(this.输入框2.value),
    })
    this.结果.textContent = 调用结果.res.toString()
  }
}
