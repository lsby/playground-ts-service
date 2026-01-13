import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'

type 属性类型 = {}
type 发出事件类型 = { 检测到未登录: null }
type 监听事件类型 = {}

export class 检查登录组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-login-check', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 结果 = await API管理器.请求postJson并处理错误('/api/user/is-login', {})
    if (结果.isLogin === true) return
    // 将当前页面路径作为 URL 参数传递给登录页
    let 当前路径 = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.assign(`/login.html?redirect=${当前路径}`)
  }
}
