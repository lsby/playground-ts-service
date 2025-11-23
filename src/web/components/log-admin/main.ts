import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { 日志显示组件 } from './log-display'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 日志管理主组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-log-admin-main', this)
  }

  private 日志显示组件 = new 日志显示组件({})

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'
    this.获得宿主样式().height = '100%'

    this.shadow.appendChild(this.日志显示组件)
  }
}
