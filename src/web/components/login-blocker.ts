import { API组件基类 } from '../base/base-api'
import { 通过路径获得接口定义 } from '../global/types'

type 接口定义 = [通过路径获得接口定义<'/api/user/is-login'>]
type 属性类型 = {}
type 发出事件类型 = { 检测到未登录: null }
type 监听事件类型 = {}

export class LsbyLogin extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-login-blocker', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 结果 = await this.请求接口并处理错误('/api/user/is-login', {})
    if (结果.isLogin === true) return
    this.清除token()
    this.派发事件('检测到未登录', null)
  }
}
