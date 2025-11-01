import { version } from '../../../app/meta-info'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 软件版本组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-version', this)
  }

  protected override async 当加载时(): Promise<void> {
    let p = 创建元素('p', { innerText: `软件版本: ${version}` })
    this.shadow.append(p)
  }
}
