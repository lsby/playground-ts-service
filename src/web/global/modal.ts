type 模态框选项 = {
  标题: string
  最大化?: boolean
  可关闭?: boolean
  关闭回调?: () => void | Promise<void>
}

class 模态框管理器 {
  private 遮罩: HTMLDivElement | null = null
  private 框: HTMLDivElement | null = null
  private 头部: HTMLDivElement | null = null
  private 内容: HTMLDivElement | null = null
  private 最大化按钮: HTMLButtonElement | null = null
  private 关闭按钮: HTMLButtonElement | null = null
  private 是否最大化 = false
  private 关闭回调: (() => void | Promise<void>) | null = null
  private 键盘处理器: ((e: KeyboardEvent) => void) | null = null

  private 初始化(): void {
    if (this.遮罩 !== null) {
      return
    }

    // 遮罩
    this.遮罩 = document.createElement('div')
    this.遮罩.style.position = 'fixed'
    this.遮罩.style.left = '0'
    this.遮罩.style.top = '0'
    this.遮罩.style.width = '100vw'
    this.遮罩.style.height = '100vh'
    this.遮罩.style.background = 'var(--遮罩颜色)'
    this.遮罩.style.display = 'none'
    this.遮罩.style.justifyContent = 'center'
    this.遮罩.style.alignItems = 'center'
    this.遮罩.style.zIndex = '9999'

    // 框
    this.框 = document.createElement('div')
    this.框.style.position = 'absolute'
    this.框.style.minWidth = '300px'
    this.框.style.minHeight = '150px'
    this.框.style.maxWidth = '80vw'
    this.框.style.background = 'var(--卡片背景颜色)'
    this.框.style.border = '1px solid var(--边框颜色)'
    this.框.style.borderRadius = '4px'
    this.框.style.boxShadow = '0 4px 12px var(--深阴影颜色)'
    this.框.style.display = 'flex'
    this.框.style.flexDirection = 'column'

    // 头部
    this.头部 = document.createElement('div')
    this.头部.style.height = '32px'
    this.头部.style.background = 'var(--按钮背景)'
    this.头部.style.display = 'flex'
    this.头部.style.alignItems = 'center'
    this.头部.style.padding = '0 8px'
    this.头部.style.justifyContent = 'space-between'
    this.头部.style.userSelect = 'none'

    let 标题元素 = document.createElement('span')
    标题元素.style.color = 'var(--文字颜色)'
    this.头部.appendChild(标题元素)

    // 右侧按钮容器
    let 右侧按钮容器 = document.createElement('div')
    右侧按钮容器.style.display = 'flex'
    右侧按钮容器.style.alignItems = 'center'
    右侧按钮容器.style.gap = '4px'

    // 最大化按钮
    this.最大化按钮 = document.createElement('button')
    this.最大化按钮.textContent = '□'
    this.最大化按钮.style.border = 'none'
    this.最大化按钮.style.background = 'transparent'
    this.最大化按钮.style.cursor = 'pointer'
    this.最大化按钮.style.fontSize = '14px'
    this.最大化按钮.style.color = 'var(--文字颜色)'
    this.最大化按钮.title = '最大化'
    this.最大化按钮.onclick = (): void => {
      this.切换最大化()
    }
    右侧按钮容器.appendChild(this.最大化按钮)

    // 关闭按钮
    this.关闭按钮 = document.createElement('button')
    this.关闭按钮.textContent = '✕'
    this.关闭按钮.style.border = 'none'
    this.关闭按钮.style.background = 'transparent'
    this.关闭按钮.style.cursor = 'pointer'
    this.关闭按钮.style.fontSize = '16px'
    this.关闭按钮.style.color = 'red'
    this.关闭按钮.style.fontWeight = 'bold'
    this.关闭按钮.onclick = async (): Promise<void> => {
      await this.关闭()
    }
    右侧按钮容器.appendChild(this.关闭按钮)

    this.头部.appendChild(右侧按钮容器)

    // 内容
    this.内容 = document.createElement('div')
    this.内容.style.padding = '8px'
    this.内容.style.flex = '1'
    this.内容.style.overflow = 'auto'
    this.内容.style.maxHeight = '90vh'

    this.框.appendChild(this.头部)
    this.框.appendChild(this.内容)
    this.遮罩.appendChild(this.框)
    document.body.appendChild(this.遮罩)
  }

  private 切换最大化(): void {
    if (this.框 === null || this.遮罩 === null || this.最大化按钮 === null) {
      return
    }

    this.是否最大化 = this.是否最大化 === false

    if (this.是否最大化 === true) {
      this.框.style.width = '100vw'
      this.框.style.height = '100vh'
      this.框.style.maxWidth = '100vw'
      this.框.style.left = '0'
      this.框.style.top = '0'
      this.框.style.transform = 'none'
      this.遮罩.style.justifyContent = 'flex-start'
      this.遮罩.style.alignItems = 'flex-start'
      this.最大化按钮.textContent = '🗗'
      this.最大化按钮.title = '还原'
    } else {
      this.框.style.width = ''
      this.框.style.height = ''
      this.框.style.maxWidth = '80vw'
      this.框.style.left = ''
      this.框.style.top = ''
      this.框.style.transform = ''
      this.遮罩.style.justifyContent = 'center'
      this.遮罩.style.alignItems = 'center'
      this.最大化按钮.textContent = '□'
      this.最大化按钮.title = '最大化'
    }
  }

  public async 显示(选项: 模态框选项, 内容: HTMLElement): Promise<void> {
    this.初始化()

    if (this.遮罩 === null || this.框 === null || this.头部 === null || this.内容 === null || this.关闭按钮 === null) {
      return
    }

    // 设置标题
    let 标题元素 = this.头部.querySelector('span')
    if (标题元素 !== null) {
      标题元素.textContent = 选项.标题
    }

    // 设置是否可关闭
    if (选项.可关闭 === false) {
      this.关闭按钮.style.display = 'none'
    } else {
      this.关闭按钮.style.display = ''
    }

    // 设置关闭回调
    this.关闭回调 = 选项.关闭回调 ?? null

    // 设置是否最大化
    if (选项.最大化 === true && this.是否最大化 === false) {
      this.切换最大化()
    } else if (选项.最大化 === false && this.是否最大化 === true) {
      this.切换最大化()
    }

    // 清空并设置内容
    while (this.内容.firstChild !== null) {
      this.内容.removeChild(this.内容.firstChild)
    }
    this.内容.appendChild(内容)

    // 显示遮罩
    this.遮罩.style.display = 'flex'

    // 绑定键盘事件
    this.键盘处理器 = async (e: KeyboardEvent): Promise<void> => {
      if (e.key === 'Escape' && 选项.可关闭 !== false) {
        await this.关闭()
      }
    }
    document.addEventListener('keydown', this.键盘处理器)
  }

  public async 关闭(): Promise<void> {
    if (this.遮罩 === null) {
      return
    }

    // 执行关闭回调
    if (this.关闭回调 !== null) {
      await this.关闭回调()
    }

    // 隐藏遮罩
    this.遮罩.style.display = 'none'

    // 清空内容
    if (this.内容 !== null) {
      while (this.内容.firstChild !== null) {
        this.内容.removeChild(this.内容.firstChild)
      }
    }

    // 移除键盘事件
    if (this.键盘处理器 !== null) {
      document.removeEventListener('keydown', this.键盘处理器)
      this.键盘处理器 = null
    }

    // 重置关闭回调
    this.关闭回调 = null
  }

  public 是否显示(): boolean {
    return this.遮罩 !== null && this.遮罩.style.display !== 'none'
  }
}

// 单例实例
let 模态框单例: 模态框管理器 | null = null

function 获取模态框实例(): 模态框管理器 {
  if (模态框单例 === null) {
    模态框单例 = new 模态框管理器()
  }
  return 模态框单例
}

export function 显示模态框(选项: 模态框选项, 内容: HTMLElement): Promise<void> {
  let 实例 = 获取模态框实例()
  return 实例.显示(选项, 内容)
}

export function 关闭模态框(): Promise<void> {
  let 实例 = 获取模态框实例()
  return 实例.关闭()
}

export function 模态框是否显示(): boolean {
  let 实例 = 获取模态框实例()
  return 实例.是否显示()
}
