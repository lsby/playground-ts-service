import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 密码输入框, 普通输入框 } from '../general/base/input'

type 属性类型 = { username: string; password: string; confirmPassword: string; mode: 'login' | 'register' }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyLogin extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['username', 'password', 'confirmPassword', 'mode']
  static {
    this.注册组件('lsby-login', this)
  }

  private 结果 = 创建元素('p')
  private 用户名输入框 = new 普通输入框({
    占位符: '请输入用户名',
    图标: '👤',
    内边距: '12px',
    字体大小: '16px',
    背景颜色: 'var(--按钮背景)',
    文字颜色: 'var(--文字颜色)',
    边框颜色: 'var(--边框颜色)',
    输入处理函数: async (值: string): Promise<void> => {
      await this.设置属性('username', 值)
    },
  })
  private 密码输入框 = new 密码输入框({
    占位符: '请输入密码',
    图标: '🔒',
    内边距: '12px',
    字体大小: '16px',
    背景颜色: 'var(--按钮背景)',
    文字颜色: 'var(--文字颜色)',
    边框颜色: 'var(--边框颜色)',
    输入处理函数: async (值: string): Promise<void> => {
      await this.设置属性('password', 值)
    },
  })
  private 确认密码输入框 = new 密码输入框({
    占位符: '请再次输入密码',
    图标: '🔑',
    内边距: '12px',
    字体大小: '16px',
    背景颜色: 'var(--按钮背景)',
    文字颜色: 'var(--文字颜色)',
    边框颜色: 'var(--边框颜色)',
    输入处理函数: async (值: string): Promise<void> => {
      await this.设置属性('confirmPassword', 值)
    },
  })
  private 登录按钮 = 创建元素('button')
  private 注册按钮 = 创建元素('button')
  private 切换按钮 = 创建元素('button')
  private enableRegister = false

  protected override async 当加载时(): Promise<void> {
    // 获取注册启用状态
    try {
      let 响应 = await API管理器.请求post接口并处理错误('/api/system-config/enable-registration/read', {})
      this.enableRegister = 响应.enable_register === 1
    } catch (_e) {
      this.enableRegister = false
    }

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
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

    let 表单 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      },
    })

    let 提示区域 = 创建元素('div', {
      style: {
        minHeight: '24px',
        textAlign: 'center',
      },
    })
    提示区域.append(this.结果)

    表单.append(this.用户名输入框, this.密码输入框, this.确认密码输入框)

    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        gap: '8px',
        marginTop: '8px',
      },
    })
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

    let 切换容器 = 创建元素('div', {
      style: {
        textAlign: 'center',
        marginTop: '8px',
      },
    })
    this.切换按钮.style.background = 'none'
    this.切换按钮.style.border = 'none'
    this.切换按钮.style.color = 'var(--主色调)'
    this.切换按钮.style.fontSize = '14px'
    this.切换按钮.style.cursor = 'pointer'
    this.切换按钮.style.padding = '4px 8px'
    切换容器.append(this.切换按钮)

    表单.append(按钮容器, 切换容器)
    卡片.append(标题, 提示区域, 表单)
    容器.append(卡片)
    this.shadow.append(容器)

    this.登录按钮.textContent = '登录'
    this.注册按钮.textContent = '注册'
    this.切换按钮.textContent = '还没有账号？立即注册'

    this.登录按钮.onclick = async (): Promise<void> => this.执行认证()
    this.注册按钮.onclick = async (): Promise<void> => this.执行认证()
    this.切换按钮.onclick = async (): Promise<void> => this.切换模式()

    let 处理回车键 = async (事件: KeyboardEvent): Promise<void> => {
      if (事件.key === 'Enter') {
        await this.执行认证()
      }
    }

    // 为输入框添加回车键监听
    this.用户名输入框.onkeydown = 处理回车键
    this.密码输入框.onkeydown = 处理回车键
    this.确认密码输入框.onkeydown = 处理回车键

    await this.更新UI()
  }

  private async 更新UI(): Promise<void> {
    let 模式 = (await this.获得属性('mode')) ?? 'login'
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
      this.切换按钮.style.display = this.enableRegister ? 'block' : 'none'
    } else {
      this.结果.textContent = '创建您的账号'
      确认密码父容器.style.display = 'flex'
      this.注册按钮.style.display = 'block'
      this.登录按钮.style.display = 'none'
      this.切换按钮.textContent = '已有账号？立即登录'
    }
  }

  private async 切换模式(): Promise<void> {
    let 当前模式 = (await this.获得属性('mode')) ?? 'login'
    if (当前模式 === 'login' && this.enableRegister === false) {
      return
    }
    let 新模式: 'login' | 'register' = 当前模式 === 'login' ? 'register' : 'login'
    await this.设置属性('mode', 新模式)
    await this.更新UI()
  }

  private async 执行认证(): Promise<void> {
    let 模式 = (await this.获得属性('mode')) ?? 'login'
    let 用户名 = (await this.获得属性('username')) ?? ''
    let 密码 = (await this.获得属性('password')) ?? ''
    if (模式 === 'register') {
      let 确认密码 = (await this.获得属性('confirmPassword')) ?? ''
      if (密码 !== 确认密码) {
        this.结果.textContent = '密码和确认密码不匹配'
        return
      }
      await API管理器.请求post接口并处理错误('/api/user/register', {
        userName: 用户名,
        userPassword: 密码,
      })
      this.结果.textContent = '注册成功，请登录'
      await this.设置属性('mode', 'login')
      await this.更新UI()
    } else {
      let 调用结果 = await API管理器.请求post接口并处理错误('/api/user/login', {
        userName: 用户名,
        userPassword: 密码,
      })
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
