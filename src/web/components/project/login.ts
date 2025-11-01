import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'

type 属性类型 = { username: string; password: string; confirmPassword: string; mode: 'login' | 'register' }
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyLogin extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['username', 'password', 'confirmPassword', 'mode']
  static {
    this.注册组件('lsby-login', this)
  }

  private 结果 = 创建元素('p')
  private 用户名输入框 = 创建元素('input')
  private 密码输入框 = 创建元素('input')
  private 确认密码输入框 = 创建元素('input')
  private 登录按钮 = 创建元素('button')
  private 注册按钮 = 创建元素('button')
  private 切换按钮 = 创建元素('button')

  protected override async 当加载时(): Promise<void> {
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

    let 用户名容器 = 创建元素('div', {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      },
    })
    let 用户名图标 = 创建元素('span', {
      innerHTML: '👤',
      style: {
        position: 'absolute',
        left: '12px',
        fontSize: '18px',
      },
    })
    用户名容器.append(用户名图标, this.用户名输入框)

    let 密码容器 = 创建元素('div', {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      },
    })
    let 密码图标 = 创建元素('span', {
      innerHTML: '🔒',
      style: {
        position: 'absolute',
        left: '12px',
        fontSize: '18px',
      },
    })
    密码容器.append(密码图标, this.密码输入框)

    let 确认密码容器 = 创建元素('div', {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      },
    })
    let 确认密码图标 = 创建元素('span', {
      innerHTML: '🔑',
      style: {
        position: 'absolute',
        left: '12px',
        fontSize: '18px',
      },
    })
    确认密码容器.append(确认密码图标, this.确认密码输入框)

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

    this.用户名输入框.oninput = async (): Promise<void> => this.设置属性('username', this.用户名输入框.value)
    this.密码输入框.oninput = async (): Promise<void> => this.设置属性('password', this.密码输入框.value)
    this.确认密码输入框.oninput = async (): Promise<void> => this.设置属性('confirmPassword', this.确认密码输入框.value)
    this.登录按钮.onclick = async (): Promise<void> => this.执行认证()
    this.注册按钮.onclick = async (): Promise<void> => this.执行认证()
    this.切换按钮.onclick = async (): Promise<void> => this.切换模式()

    let 处理回车键 = async (事件: KeyboardEvent): Promise<void> => {
      if (事件.key === 'Enter') {
        await this.执行认证()
      }
    }
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
    let 新模式: 'login' | 'register' = 当前模式 === 'login' ? 'register' : 'login'
    await this.设置属性('mode', 新模式)
    void this.更新UI()
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
