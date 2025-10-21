import { 组件基类 } from '../../base/base'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 软件版本组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-version', this)
  }

  protected override async 当加载时(): Promise<void> {
    let p = document.createElement('p')
    // 插件会处理'PACKAGE_VERSION'这个立即值, 替换为实际的版本号
    p.innerText = '软件版本: PACKAGE_VERSION'
    this.shadow.append(p)
  }
}
