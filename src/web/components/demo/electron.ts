import { 组件基类 } from '@lsby/ts-web-component'
import { GlobalWeb } from '../../global/global'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试electron组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-electron', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  protected override async 当加载时(): Promise<void> {
    let 按钮 = document.createElement('button')

    按钮.innerText = '点我'
    按钮.onclick = async (): Promise<void> => {
      await this.API管理器.请求接口并处理错误('/api/demo/electron/dialog', {})
    }

    this.shadow.append(按钮)
  }
}
