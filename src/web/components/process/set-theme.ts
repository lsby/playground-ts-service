import { 组件基类 } from '../../base/base'
import { 主题管理器 } from '../../global/manager/theme-manager'

type 属性类型 = { 从数据库加载?: 'true' | 'false' }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 设置主题组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('set-theme', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 从数据库加载属性 = await this.获得属性('从数据库加载')
    let 从数据库加载 = 从数据库加载属性 !== 'false'
    await 主题管理器.初始化(从数据库加载)
  }
}
