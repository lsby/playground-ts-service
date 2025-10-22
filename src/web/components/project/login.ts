import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'

type 属性类型 = { username: string; password: string; confirmPassword: string; mode: 'login' | 'register' }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyLogin extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['username', 'password', 'confirmPassword', 'mode']
  static {
    this.注册组件('lsby-login', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  private 结果 = document.createElement('p')
  private 用户名输入框 = document.createElement('input')
  private 密码输入框 = document.createElement('input')
  private 确认密码输入框 = document.createElement('input')
  private 登录按钮 = document.createElement('button')
  private 注册按钮 = document.createElement('button')
  private 切换按钮 = document.createElement('button')

  protected override async 当加载时(): Promise<void> {
    let 容器 = document.createElement('div')
    容器.style.display = 'flex'
    容器.style.alignItems = 'center'
    容器.style.justifyContent = 'center'
    容器.style.minHeight = '100vh'
    容器.style.backgroundColor = 'var(--背景颜色)'
    容器.style.padding = '20px'
    容器.style.boxSizing = 'border-box'

    let 卡片 = document.createElement('div')
    卡片.style.backgroundColor = 'var(--卡片背景颜色)'
    卡片.style.borderRadius = '8px'
    卡片.style.boxShadow = '0 4px 12px var(--深阴影颜色)'
    卡片.style.padding = '32px'
    卡片.style.width = '100%'
    卡片.style.maxWidth = '400px'

    let 标题 = document.createElement('h1')
    标题.style.margin = '0 0 16px 0'
    标题.style.fontSize = '24px'
    标题.style.fontWeight = 'bold'
    标题.style.color = 'var(--文字颜色)'
    标题.style.textAlign = 'center'
    标题.textContent = '欢迎'

    let 表单 = document.createElement('div')
    表单.style.display = 'flex'
    表单.style.flexDirection = 'column'
    表单.style.gap = '16px'

    let 提示区域 = document.createElement('div')
    提示区域.style.minHeight = '24px'
    提示区域.style.textAlign = 'center'
    提示区域.append(this.结果)

    let 用户名容器 = document.createElement('div')
    用户名容器.style.position = 'relative'
    用户名容器.style.display = 'flex'
    用户名容器.style.alignItems = 'center'
    let 用户名图标 = document.createElement('span')
    用户名图标.style.position = 'absolute'
    用户名图标.style.left = '12px'
    用户名图标.style.fontSize = '18px'
    用户名图标.innerHTML = '👤'
    用户名容器.append(用户名图标, this.用户名输入框)

    let 密码容器 = document.createElement('div')
    密码容器.style.position = 'relative'
    密码容器.style.display = 'flex'
    密码容器.style.alignItems = 'center'
    let 密码图标 = document.createElement('span')
    密码图标.style.position = 'absolute'
    密码图标.style.left = '12px'
    密码图标.style.fontSize = '18px'
    密码图标.innerHTML = '🔒'
    密码容器.append(密码图标, this.密码输入框)

    let 确认密码容器 = document.createElement('div')
    确认密码容器.style.position = 'relative'
    确认密码容器.style.display = 'flex'
    确认密码容器.style.alignItems = 'center'
    let 确认密码图标 = document.createElement('span')
    确认密码图标.style.position = 'absolute'
    确认密码图标.style.left = '12px'
    确认密码图标.style.fontSize = '18px'
    确认密码图标.innerHTML = '🔑'
    确认密码容器.append(确认密码图标, this.确认密码输入框)

    let 按钮容器 = document.createElement('div')
    按钮容器.style.display = 'flex'
    按钮容器.style.gap = '8px'
    按钮容器.style.marginTop = '8px'
    this.登录按钮.style.flex = '1'
    this.登录按钮.style.padding = '12px'
    this.登录按钮.style.border = 'none'
    this.登录按钮.style.borderRadius = '4px'
    this.登录按钮.style.fontSize = '16px'
    this.登录按钮.style.cursor = 'pointer'
    this.登录按钮.style.backgroundColor = 'var(--主色调)'
    this.登录按钮.style.color = 'white'
    this.注册按钮.style.flex = '1'
    this.注册按钮.style.padding = '12px'
    this.注册按钮.style.border = 'none'
    this.注册按钮.style.borderRadius = '4px'
    this.注册按钮.style.fontSize = '16px'
    this.注册按钮.style.cursor = 'pointer'
    this.注册按钮.style.backgroundColor = 'var(--主色调)'
    this.注册按钮.style.color = 'white'
    按钮容器.append(this.登录按钮, this.注册按钮)

    let 切换容器 = document.createElement('div')
    切换容器.style.textAlign = 'center'
    切换容器.style.marginTop = '8px'
    this.切换按钮.style.background = 'none'
    this.切换按钮.style.border = 'none'
    this.切换按钮.style.color = 'var(--主色调)'
    this.切换按钮.style.fontSize = '14px'
    this.切换按钮.style.cursor = 'pointer'
    this.切换按钮.style.padding = '4px 8px'
    切换容器.append(this.切换按钮)

    表单.append(用户名容器, 密码容器, 确认密码容器, 按钮容器, 切换容器)
    卡片.append(标题, 提示区域, 表单)
    容器.append(卡片)
    this.shadow.append(容器)

    this.结果.style.margin = '0'
    this.结果.style.padding = '8px'
    this.结果.style.borderRadius = '4px'
    this.结果.style.fontSize = '14px'
    this.结果.style.backgroundColor = 'var(--按钮背景)'
    this.结果.style.color = 'var(--文字颜色)'
    this.结果.textContent = '请输入用户名和密码'

    this.用户名输入框.style.width = '100%'
    this.用户名输入框.style.padding = '12px 12px 12px 40px'
    this.用户名输入框.style.border = '1px solid var(--边框颜色)'
    this.用户名输入框.style.borderRadius = '4px'
    this.用户名输入框.style.fontSize = '16px'
    this.用户名输入框.style.backgroundColor = 'var(--按钮背景)'
    this.用户名输入框.style.color = 'var(--文字颜色)'
    this.用户名输入框.style.boxSizing = 'border-box'
    this.用户名输入框.placeholder = '请输入用户名'

    this.密码输入框.style.width = '100%'
    this.密码输入框.style.padding = '12px 12px 12px 40px'
    this.密码输入框.style.border = '1px solid var(--边框颜色)'
    this.密码输入框.style.borderRadius = '4px'
    this.密码输入框.style.fontSize = '16px'
    this.密码输入框.style.backgroundColor = 'var(--按钮背景)'
    this.密码输入框.style.color = 'var(--文字颜色)'
    this.密码输入框.style.boxSizing = 'border-box'
    this.密码输入框.placeholder = '请输入密码'
    this.密码输入框.type = 'password'

    this.确认密码输入框.style.width = '100%'
    this.确认密码输入框.style.padding = '12px 12px 12px 40px'
    this.确认密码输入框.style.border = '1px solid var(--边框颜色)'
    this.确认密码输入框.style.borderRadius = '4px'
    this.确认密码输入框.style.fontSize = '16px'
    this.确认密码输入框.style.backgroundColor = 'var(--按钮背景)'
    this.确认密码输入框.style.color = 'var(--文字颜色)'
    this.确认密码输入框.style.boxSizing = 'border-box'
    this.确认密码输入框.placeholder = '请再次输入密码'
    this.确认密码输入框.type = 'password'

    this.登录按钮.textContent = '登录'
    this.注册按钮.textContent = '注册'
    this.切换按钮.textContent = '还没有账号？立即注册'

    this.用户名输入框.oninput = (): void => this.设置属性('username', this.用户名输入框.value)
    this.密码输入框.oninput = (): void => this.设置属性('password', this.密码输入框.value)
    this.确认密码输入框.oninput = (): void => this.设置属性('confirmPassword', this.确认密码输入框.value)
    this.登录按钮.onclick = async (): Promise<void> => this.执行认证()
    this.注册按钮.onclick = async (): Promise<void> => this.执行认证()
    this.切换按钮.onclick = (): void => this.切换模式()

    let 处理回车键 = async (事件: KeyboardEvent): Promise<void> => {
      if (事件.key === 'Enter') {
        await this.执行认证()
      }
    }
    this.用户名输入框.onkeydown = 处理回车键
    this.密码输入框.onkeydown = 处理回车键
    this.确认密码输入框.onkeydown = 处理回车键

    this.更新UI()
  }

  private 更新UI(): void {
    let 模式 = this.获得属性('mode') ?? 'login'
    let 确认密码父容器 = this.确认密码输入框.parentElement
    if (确认密码父容器 === null) {
      return
    }
    if (模式 === 'login') {
      this.结果.textContent = '请输入用户名和密码'
      确认密码父容器.style.display = 'none'
      this.注册按钮.style.display = 'none'
      this.登录按钮.style.display = 'block'
      this.切换按钮.textContent = '还没有账号？立即注册'
    } else {
      this.结果.textContent = '创建您的账号'
      确认密码父容器.style.display = 'flex'
      this.注册按钮.style.display = 'block'
      this.登录按钮.style.display = 'none'
      this.切换按钮.textContent = '已有账号？立即登录'
    }
  }

  private 切换模式(): void {
    let 当前模式 = this.获得属性('mode') ?? 'login'
    let 新模式: 'login' | 'register' = 当前模式 === 'login' ? 'register' : 'login'
    this.设置属性('mode', 新模式)
    this.更新UI()
  }

  private async 执行认证(): Promise<void> {
    let 模式 = this.获得属性('mode') ?? 'login'
    let 用户名 = this.获得属性('username') ?? ''
    let 密码 = this.获得属性('password') ?? ''
    if (模式 === 'register') {
      let 确认密码 = this.获得属性('confirmPassword') ?? ''
      if (密码 !== 确认密码) {
        this.结果.textContent = '密码和确认密码不匹配'
        return
      }
      await this.API管理器.请求接口并处理错误('/api/user/register', {
        userName: 用户名,
        userPassword: 密码,
      })
      this.结果.textContent = '注册成功，请登录'
      this.设置属性('mode', 'login')
      this.更新UI()
    } else {
      let 调用结果 = await this.API管理器.请求接口并处理错误('/api/user/login', {
        userName: 用户名,
        userPassword: 密码,
      })
      this.API管理器.设置token(调用结果.token)
      window.location.assign('/')
    }
  }
}
