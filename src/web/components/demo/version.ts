import { version } from '../../../app/version'
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
    p.innerText = `软件版本: ${version}`
    this.shadow.append(p)
  }
}
