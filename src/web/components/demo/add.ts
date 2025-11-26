import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 数字输入框 } from '../general/form/input'
import { LsbyContainer } from '../layout/container'

type 属性类型 = { a: string; b: string }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试加法组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['a', 'b']

  static {
    this.注册组件('lsby-demo-add', this)
  }

  private 结果 = 创建元素('p')
  private 输入框1 = new 数字输入框({
    占位符: '输入第一个数字',
    输入处理函数: async (值: string): Promise<void> => {
      await this.设置属性('a', 值)
    },
  })
  private 输入框2 = new 数字输入框({
    占位符: '输入第二个数字',
    输入处理函数: async (值: string): Promise<void> => {
      await this.设置属性('b', 值)
    },
  })

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
  }
  protected override async 当变化时(_name: keyof 属性类型, _oldValue: string, _newValue: string): Promise<void> {
    this.输入框1.设置值((await this.获得属性('a')) ?? '0')
    this.输入框2.设置值((await this.获得属性('b')) ?? '0')

    let 调用结果 = await API管理器.请求post接口并处理错误('/api/demo/base/add', {
      a: parseInt(this.输入框1.获得值()),
      b: parseInt(this.输入框2.获得值()),
    })
    this.结果.textContent = 调用结果.res.toString()
  }
}
