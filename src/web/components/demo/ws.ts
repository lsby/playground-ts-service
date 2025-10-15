import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试ws组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-demo-ws-test', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  private 按钮 = document.createElement('button')
  private 结果 = document.createElement('p')

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.按钮)
    this.shadow.append(this.结果)

    this.按钮.textContent = '开始测试'
    this.按钮.onclick = async (): Promise<void> => {
      await this.API管理器.请求接口('/api/demo/ws/ws-test', {}, async (data) => {
        this.结果.textContent = data.data
      })
    }
  }
}
