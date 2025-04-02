import { API组件基类 } from '../base/base-api'

type 接口定义 = {
  ws测试接口: {
    path: '/api/base/ws-test'
    method: 'post'
    input: {}
    errorOutput: { status: 'fail'; data: never }
    successOutput: { status: 'success'; data: {} }
    webSocketData: { data: string }
  }
}
type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyWsTest extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-ws-test', this)
  }

  private 结果 = document.createElement('p')
  private 按钮 = document.createElement('button')

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.结果)
    this.shadow.append(this.按钮)

    this.按钮.textContent = '开始测试'
    this.按钮.onclick = async (): Promise<void> => {
      await this.请求接口('ws测试接口', {}, async (data) => {
        this.结果.innerHTML = data.data
      })
    }
  }
}
