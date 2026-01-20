import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 主要按钮, 链接按钮 } from '../general/base/base-button'
import { 表单 } from '../general/form/form'
import { 密码输入框, 普通输入框 } from '../general/form/form-input'

type 属性类型 = { username: string; password: string; confirmPassword: string; mode: 'login' | 'register' }
type 发出事件类型 = {}
type 监听事件类型 = {}

type 登录表单数据 = { username: string; password: string }

type 注册表单数据 = { username: string; password: string; confirmPassword: string }

export class 登录组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['username', 'password', 'confirmPassword', 'mode']
  static {
    this.注册组件('lsby-login', this)
  }

  private 结果 = 创建元素('p')
  private 登录表单: 表单<登录表单数据> | null = null
  private 注册表单: 表单<注册表单数据> | null = null
  private 登录表单容器 = 创建元素('div')
  private 注册表单容器 = 创建元素('div')
  private 登录按钮: 主要按钮 | null = null
  private 注册按钮: 主要按钮 | null = null
  private 切换按钮: 链接按钮 | null = null
  private enableRegister = false

  protected override async 当加载时(): Promise<void> {
    // 获取注册启用状态
    try {
      let 响应 = await API管理器.请求postJson并处理错误('/api/project/get-enable-registration', {})
      this.enableRegister = 响应.enable_register
    } catch (_e) {
      this.enableRegister = false
    }

    // 创建登录表单
    this.登录表单 = new 表单<登录表单数据>({
      项列表: [
        {
          键: 'username',
          组件: new 普通输入框({
            占位符: '请输入用户名',
            元素样式: {
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'var(--按钮背景)',
              color: 'var(--文字颜色)',
              borderColor: 'var(--边框颜色)',
            },
          }),
          宽度: 2,
          标签: '用户名',
        },
        {
          键: 'password',
          组件: new 密码输入框({
            占位符: '请输入密码',
            元素样式: {
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'var(--按钮背景)',
              color: 'var(--文字颜色)',
              borderColor: 'var(--边框颜色)',
            },
          }),
          宽度: 2,
          标签: '密码',
        },
      ],
      元素样式: { gap: '12px' },
    })

    // 创建注册表单
    this.注册表单 = new 表单<注册表单数据>({
      项列表: [
        {
          键: 'username',
          组件: new 普通输入框({
            占位符: '请输入用户名',
            元素样式: {
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'var(--按钮背景)',
              color: 'var(--文字颜色)',
              borderColor: 'var(--边框颜色)',
            },
          }),
          宽度: 2,
          标签: '用户名',
        },
        {
          键: 'password',
          组件: new 密码输入框({
            占位符: '请输入密码',
            元素样式: {
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'var(--按钮背景)',
              color: 'var(--文字颜色)',
              borderColor: 'var(--边框颜色)',
            },
          }),
          宽度: 2,
          标签: '密码',
        },
        {
          键: 'confirmPassword',
          组件: new 密码输入框({
            占位符: '请再次输入密码',
            元素样式: {
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'var(--按钮背景)',
              color: 'var(--文字颜色)',
              borderColor: 'var(--边框颜色)',
            },
          }),
          宽度: 2,
          标签: '确认密码',
        },
      ],
      元素样式: { gap: '12px' },
    })

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--背景颜色)',
        padding: '20px',
        boxSizing: 'border-box',
      },
    })

    let 卡片 = 创建元素('div', {
      style: {
        backgroundColor: 'var(--卡片背景颜色)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
      },
    })

    let 标题 = 创建元素('h1', {
      textContent: '欢迎',
      style: {
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--文字颜色)',
        textAlign: 'center',
      },
    })

    let 提示区域 = 创建元素('div', { style: { minHeight: '24px', textAlign: 'center' } })
    提示区域.append(this.结果)

    let 表单容器 = 创建元素('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } })

    this.登录表单容器.style.display = 'block'
    this.登录表单容器.appendChild(this.登录表单)

    this.注册表单容器.style.display = 'none'
    this.注册表单容器.appendChild(this.注册表单)

    表单容器.appendChild(this.登录表单容器)
    表单容器.appendChild(this.注册表单容器)

    let 按钮容器 = 创建元素('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } })
    this.登录按钮 = new 主要按钮({
      文本: '登录',
      元素样式: { flex: '1', padding: '12px', fontSize: '16px', width: '100%' },
      宿主样式: { width: '100%' },
      点击处理函数: async (): Promise<void> => this.执行认证(),
    })
    this.注册按钮 = new 主要按钮({
      文本: '注册',
      元素样式: { flex: '1', padding: '12px', fontSize: '16px', width: '100%' },
      宿主样式: { width: '100%' },
      点击处理函数: async (): Promise<void> => this.执行认证(),
    })
    按钮容器.appendChild(this.登录按钮)
    按钮容器.appendChild(this.注册按钮)

    let 切换容器 = 创建元素('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '8px' } })
    this.切换按钮 = new 链接按钮({
      文本: '还没有账号？立即注册',
      元素样式: { fontSize: '14px' },
      点击处理函数: async (): Promise<void> => this.切换模式(),
    })
    切换容器.appendChild(this.切换按钮)

    表单容器.append(按钮容器, 切换容器)
    卡片.append(标题, 提示区域, 表单容器)
    容器.append(卡片)
    this.shadow.append(容器)

    let 处理回车键 = async (事件: KeyboardEvent): Promise<void> => {
      if (事件.key === 'Enter') {
        await this.执行认证()
      }
    }

    // 为登录表单的input元素添加回车键监听
    let 登录元素 = this.登录表单.获得所有元素()
    if (登录元素.username !== void 0) {
      登录元素.username.onkeydown = 处理回车键
    }
    if (登录元素.password !== void 0) {
      登录元素.password.onkeydown = 处理回车键
    }

    // 检查 URL 参数是否指定注册模式
    let urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('register') === 'true' && this.enableRegister) {
      await this.设置属性('mode', 'register')
    }

    await this.更新UI()
  }

  private async 更新UI(): Promise<void> {
    let 模式 = (await this.获得属性('mode')) ?? 'login'
    if (模式 === 'login') {
      this.结果.textContent = '请输入用户名和密码'
      this.登录表单容器.style.display = 'block'
      this.注册表单容器.style.display = 'none'
      if (this.注册按钮 !== null) {
        this.注册按钮.获得宿主样式().display = 'none'
      }
      if (this.登录按钮 !== null) {
        this.登录按钮.获得宿主样式().display = 'block'
      }
      if (this.切换按钮 !== null) {
        this.切换按钮.获得宿主样式().display = this.enableRegister ? 'block' : 'none'
        this.切换按钮.设置文本('还没有账号？立即注册')
      }
    } else {
      this.结果.textContent = '创建您的账号'
      this.登录表单容器.style.display = 'none'
      this.注册表单容器.style.display = 'block'
      if (this.注册按钮 !== null) {
        this.注册按钮.获得宿主样式().display = 'block'
      }
      if (this.登录按钮 !== null) {
        this.登录按钮.获得宿主样式().display = 'none'
      }
      if (this.切换按钮 !== null) {
        this.切换按钮.获得宿主样式().display = 'block'
        this.切换按钮.设置文本('已经有账号？立即登录')
      }
    }
  }

  private async 切换模式(): Promise<void> {
    let 当前模式 = (await this.获得属性('mode')) ?? 'login'
    if (当前模式 === 'login' && this.enableRegister === false) {
      return
    }
    let 新模式: 'login' | 'register' = 当前模式 === 'login' ? 'register' : 'login'
    await this.设置属性('mode', 新模式)
    // 更新 URL 参数
    let url = new URL(window.location.href)
    if (新模式 === 'register') {
      url.searchParams.set('register', 'true')
    } else {
      url.searchParams.delete('register')
    }
    window.history.replaceState(null, '', url.toString())
    await this.更新UI()
  }

  private async 执行认证(): Promise<void> {
    let 模式 = (await this.获得属性('mode')) ?? 'login'

    if (模式 === 'register') {
      if (this.注册表单 === null) return
      let 表单数据 = this.注册表单.获得数据()
      let 用户名 = 表单数据.username
      let 密码 = 表单数据.password
      let 确认密码 = 表单数据.confirmPassword

      if (密码 !== 确认密码) {
        this.结果.textContent = '密码和确认密码不匹配'
        return
      }
      await API管理器.请求postJson并处理错误('/api/user/register', { userName: 用户名, userPassword: 密码 })
      this.结果.textContent = '注册成功，请登录'
      await this.设置属性('mode', 'login')
      await this.更新UI()
    } else {
      if (this.登录表单 === null) return
      let 表单数据 = this.登录表单.获得数据()
      let 用户名 = 表单数据.username
      let 密码 = 表单数据.password

      let 调用结果 = await API管理器.请求postJson并处理错误('/api/user/login', { userName: 用户名, userPassword: 密码 })
      API管理器.设置token(调用结果.token)
      // 检查 URL 参数中是否有重定向路径
      let urlParams = new URLSearchParams(window.location.search)
      let 重定向路径 = urlParams.get('redirect')
      if (重定向路径 !== null) {
        window.location.assign(decodeURIComponent(重定向路径))
      } else {
        window.location.assign('/')
      }
    }
  }
}
