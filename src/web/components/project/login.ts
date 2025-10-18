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
    this.初始化样式()

    let 容器 = document.createElement('div')
    容器.className = 'login-container'

    let 卡片 = document.createElement('div')
    卡片.className = 'login-card'

    let 标题 = document.createElement('h1')
    标题.className = 'login-title'
    标题.textContent = '欢迎'

    let 表单 = document.createElement('div')
    表单.className = 'login-form'

    let 提示区域 = document.createElement('div')
    提示区域.className = 'message-area'
    提示区域.append(this.结果)

    let 用户名容器 = document.createElement('div')
    用户名容器.className = 'input-group'
    let 用户名图标 = document.createElement('span')
    用户名图标.className = 'input-icon'
    用户名图标.innerHTML = '👤'
    用户名容器.append(用户名图标, this.用户名输入框)

    let 密码容器 = document.createElement('div')
    密码容器.className = 'input-group'
    let 密码图标 = document.createElement('span')
    密码图标.className = 'input-icon'
    密码图标.innerHTML = '🔒'
    密码容器.append(密码图标, this.密码输入框)

    let 确认密码容器 = document.createElement('div')
    确认密码容器.className = 'input-group'
    let 确认密码图标 = document.createElement('span')
    确认密码图标.className = 'input-icon'
    确认密码图标.innerHTML = '🔑'
    确认密码容器.append(确认密码图标, this.确认密码输入框)

    let 按钮容器 = document.createElement('div')
    按钮容器.className = 'button-group'
    this.登录按钮.className = 'btn btn-primary'
    this.注册按钮.className = 'btn btn-primary'
    按钮容器.append(this.登录按钮, this.注册按钮)

    let 切换容器 = document.createElement('div')
    切换容器.className = 'toggle-container'
    this.切换按钮.className = 'btn-link'
    切换容器.append(this.切换按钮)

    表单.append(用户名容器, 密码容器, 确认密码容器, 按钮容器, 切换容器)
    卡片.append(标题, 提示区域, 表单)
    容器.append(卡片)
    this.shadow.append(容器)

    this.结果.textContent = '请输入用户名和密码'
    this.用户名输入框.placeholder = '请输入用户名'
    this.用户名输入框.className = 'input-field'
    this.密码输入框.placeholder = '请输入密码'
    this.密码输入框.type = 'password'
    this.密码输入框.className = 'input-field'
    this.确认密码输入框.placeholder = '请再次输入密码'
    this.确认密码输入框.type = 'password'
    this.确认密码输入框.className = 'input-field'
    this.登录按钮.textContent = '登录'
    this.注册按钮.textContent = '注册'
    this.切换按钮.textContent = '还没有账号？立即注册'

    this.用户名输入框.oninput = (): void => this.设置属性('username', this.用户名输入框.value)
    this.密码输入框.oninput = (): void => this.设置属性('password', this.密码输入框.value)
    this.确认密码输入框.oninput = (): void => this.设置属性('confirmPassword', this.确认密码输入框.value)
    this.登录按钮.onclick = async (): Promise<void> => this.执行认证()
    this.注册按钮.onclick = async (): Promise<void> => this.执行认证()
    this.切换按钮.onclick = (): void => this.切换模式()

    this.更新UI()
  }

  private 初始化样式(): void {
    let 样式 = document.createElement('style')
    样式.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, var(--主色调) 0%, #667eea 100%);
        padding: 20px;
        box-sizing: border-box;
      }

      @media (prefers-color-scheme: dark) {
        .login-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
      }

      .login-card {
        background: var(--卡片背景颜色);
        border-radius: 20px;
        box-shadow: 0 20px 60px var(--深阴影颜色);
        padding: 48px 40px;
        width: 100%;
        max-width: 420px;
        backdrop-filter: blur(10px);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .login-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 30px 80px var(--深阴影颜色);
      }

      .login-title {
        margin: 0 0 16px 0;
        font-size: 32px;
        font-weight: 700;
        color: var(--文字颜色);
        text-align: center;
        letter-spacing: -0.5px;
      }

      .message-area {
        margin-bottom: 24px;
        min-height: 24px;
        text-align: center;
      }

      .message-area p {
        margin: 0;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        background: var(--按钮背景);
        color: var(--文字颜色);
        transition: all 0.3s ease;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .input-group {
        position: relative;
        display: flex;
        align-items: center;
        transition: transform 0.2s ease;
      }

      .input-group:focus-within {
        transform: translateY(-2px);
      }

      .input-icon {
        position: absolute;
        left: 16px;
        font-size: 20px;
        z-index: 1;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      }

      .input-group:focus-within .input-icon {
        opacity: 1;
      }

      .input-field {
        width: 100%;
        padding: 14px 16px 14px 50px;
        border: 2px solid var(--边框颜色);
        border-radius: 12px;
        font-size: 16px;
        background: var(--按钮背景);
        color: var(--文字颜色);
        transition: all 0.3s ease;
        box-sizing: border-box;
        outline: none;
      }

      .input-field:focus {
        border-color: var(--主色调);
        background: var(--卡片背景颜色);
        box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
      }

      .input-field::placeholder {
        color: var(--文字颜色);
        opacity: 0.5;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 8px;
      }

      .btn {
        flex: 1;
        padding: 14px 24px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        position: relative;
        overflow: hidden;
      }

      .btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .btn:active::before {
        width: 300px;
        height: 300px;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--主色调) 0%, #5cadff 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      .toggle-container {
        text-align: center;
        margin-top: 8px;
      }

      .btn-link {
        background: none;
        border: none;
        color: var(--主色调);
        font-size: 14px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s ease;
        outline: none;
      }

      .btn-link:hover {
        background: var(--悬浮背景颜色);
        transform: translateY(-1px);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .login-card {
        animation: fadeIn 0.5s ease-out;
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 32px 24px;
        }

        .login-title {
          font-size: 28px;
        }

        .input-field {
          font-size: 14px;
        }

        .btn {
          font-size: 14px;
          padding: 12px 20px;
        }
      }
    `
    this.shadow.append(样式)
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
