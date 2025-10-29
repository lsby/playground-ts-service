import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'

type 属性类型 = {}
type 发出事件类型 = { 检测到未登录: null }
type 监听事件类型 = {}

export class LsbyLoginCheck extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-login-check', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  protected override async 当加载时(): Promise<void> {
    let 结果 = await this.API管理器.请求post接口并处理错误('/api/user/is-login', {})
    if (结果.isLogin === true) return
    this.API管理器.清除token()
    window.location.assign('/login.html')
  }
}
