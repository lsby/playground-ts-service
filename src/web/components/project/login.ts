import { API组件基类 } from '../../base/base-api'
import { 通过路径获得接口定义 } from '../../global/types'

type 接口定义 = [通过路径获得接口定义<'/api/user/login'>]
type 属性类型 = { username: string; password: string }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyLogin extends API组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = ['username', 'password']
  static {
    this.注册组件('lsby-login', this)
  }

  private 结果 = document.createElement('p')
  private 用户名输入框 = document.createElement('input')
  private 密码输入框 = document.createElement('input')
  private 登录按钮 = document.createElement('button')

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.结果)
    this.shadow.append(this.用户名输入框)
    this.shadow.append(this.密码输入框)
    this.shadow.append(this.登录按钮)

    this.结果.textContent = '请输入用户名和密码'
    this.用户名输入框.placeholder = '用户名'
    this.密码输入框.placeholder = '密码'
    this.密码输入框.type = 'password'
    this.登录按钮.textContent = '登录'

    this.用户名输入框.oninput = (): void => this.设置属性('username', this.用户名输入框.value)
    this.密码输入框.oninput = (): void => this.设置属性('password', this.密码输入框.value)
    this.登录按钮.onclick = async (): Promise<void> => this.执行登录()
  }

  private async 执行登录(): Promise<void> {
    let 调用结果 = await this.请求接口并处理错误('/api/user/login', {
      userName: this.获得属性('username') ?? '',
      userPassword: this.获得属性('password') ?? '',
    })
    this.设置token(调用结果.token)
    window.location.assign('/')
  }
}
