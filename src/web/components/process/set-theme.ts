import { 组件基类 } from '../../base/base'
import { 主题管理器 } from '../../global/manager/theme-manager'

type 发出事件类型 = {}
type 监听事件类型 = {}

type 设置主题配置 = { 从数据库加载?: boolean | undefined }

export class 设置主题组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('set-theme', this)
  }

  private 配置: 设置主题配置

  public constructor(配置: 设置主题配置 = {}) {
    super()
    this.配置 = 配置
  }

  protected override async 当加载时(): Promise<void> {
    let 从数据库加载 = this.配置.从数据库加载 !== false
    await 主题管理器.初始化(从数据库加载)
  }
}
