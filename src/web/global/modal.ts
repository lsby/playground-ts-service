type 模态框选项 = {
  标题: string
  最大化?: boolean
  可关闭?: boolean
  关闭回调?: () => void | Promise<void>
  宽度?: string
  高度?: string
}

import { 文本按钮 } from '../components/general/base/button'
import { 创建元素 } from './create-element'

class 模态框管理器 {
  private 遮罩: HTMLDivElement | null = null
  private 框: HTMLDivElement | null = null
  private 头部: HTMLDivElement | null = null
  private 内容: HTMLDivElement | null = null
  private 最大化按钮: 文本按钮 | null = null
  private 关闭按钮: 文本按钮 | null = null
  private 标题元素: HTMLSpanElement | null = null
  private 是否最大化 = false
  private 关闭回调: (() => void | Promise<void>) | null = null
  private 键盘处理器: ((e: KeyboardEvent) => void) | null = null
  private resize观察器: ResizeObserver | null = null
  private 头部高度 = 32
  private 当前宽度 = '60vw'
  private 当前高度 = '60vh'

  private 初始化(): void {
    if (this.遮罩 !== null) {
      return
    }

    // 遮罩
    this.遮罩 = 创建元素('div', {
      style: {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        background: 'var(--遮罩颜色)',
        display: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
      },
    })

    // 框
    this.框 = 创建元素('div', {
      style: {
        position: 'absolute',
        background: 'var(--卡片背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        display: 'flex',
        flexDirection: 'column',
        width: '60vw',
        height: '60vh',
      },
    })

    // 头部
    this.头部 = 创建元素('div', {
      style: {
        height: `${this.头部高度}px`,
        background: 'var(--按钮背景)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        justifyContent: 'space-between',
        userSelect: 'none',
      },
    })

    let 标题元素 = 创建元素('span', {
      style: {
        color: 'var(--文字颜色)',
      },
    })
    this.头部.appendChild(标题元素)
    this.标题元素 = 标题元素

    // 右侧按钮容器
    let 右侧按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
    })

    // 最大化按钮
    this.最大化按钮 = new 文本按钮({
      文本: '□',
      元素样式: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        color: 'var(--文字颜色)',
      },
      标题: '最大化',
      点击处理函数: (): void => {
        this.切换最大化()
      },
    })
    右侧按钮容器.appendChild(this.最大化按钮)

    // 关闭按钮
    this.关闭按钮 = new 文本按钮({
      文本: '✕',
      元素样式: {
        padding: '0',
        fontSize: '16px',
        color: 'red',
        fontWeight: 'bold',
        border: 'none',
        background: 'transparent',
      },
      点击处理函数: async (): Promise<void> => {
        await this.关闭()
      },
    })
    右侧按钮容器.appendChild(this.关闭按钮)

    this.头部.appendChild(右侧按钮容器)

    // 内容
    this.内容 = 创建元素('div', {
      style: {
        flex: '1',
        overflow: 'auto',
        width: '60vw',
        height: '80vh',
      },
    })

    this.框.appendChild(this.头部)
    this.框.appendChild(this.内容)
    this.遮罩.appendChild(this.框)
    document.body.appendChild(this.遮罩)
  }

  private 切换最大化(): void {
    if (this.框 === null || this.遮罩 === null || this.最大化按钮 === null || this.内容 === null) {
      return
    }

    this.是否最大化 = this.是否最大化 === false

    if (this.是否最大化 === true) {
      this.框.style.width = '100vw'
      this.框.style.height = '100vh'
      this.框.style.left = '0'
      this.框.style.top = '0'
      this.框.style.transform = 'none'
      this.遮罩.style.justifyContent = 'flex-start'
      this.遮罩.style.alignItems = 'flex-start'
      this.内容.style.width = '100%'
      this.内容.style.height = `calc(100vh - ${this.头部高度}px)`
      this.最大化按钮.设置文本('🗗')
      this.最大化按钮.设置标题('还原')
    } else {
      this.框.style.width = this.当前宽度
      this.框.style.height = this.当前高度
      this.框.style.left = ''
      this.框.style.top = ''
      this.框.style.transform = ''
      this.遮罩.style.justifyContent = 'center'
      this.遮罩.style.alignItems = 'center'
      this.内容.style.width = this.当前宽度
      this.内容.style.height = this.当前高度
      this.最大化按钮.设置文本('□')
      this.最大化按钮.设置标题('最大化')
    }
  }

  public async 显示(选项: 模态框选项, 内容: HTMLElement): Promise<void> {
    this.初始化()

    if (
      this.遮罩 === null ||
      this.框 === null ||
      this.头部 === null ||
      this.内容 === null ||
      this.关闭按钮 === null ||
      this.最大化按钮 === null
    ) {
      return
    }

    // 设置标题
    if (this.标题元素 !== null) {
      this.标题元素.textContent = 选项.标题
    }

    // 设置是否可关闭
    if (选项.可关闭 === false) {
      this.关闭按钮.获得宿主样式().display = 'none'
    } else {
      this.关闭按钮.获得宿主样式().display = ''
    }

    // 设置关闭回调
    this.关闭回调 = 选项.关闭回调 ?? null

    // 清空并设置内容
    while (this.内容.firstChild !== null) {
      this.内容.removeChild(this.内容.firstChild)
    }
    this.内容.appendChild(内容)

    // 保存当前宽度和高度
    this.当前宽度 = 选项.宽度 ?? '60vw'
    this.当前高度 = 选项.高度 ?? '60vh'

    // 设置是否最大化
    if (选项.最大化 === true) {
      this.框.style.width = '100vw'
      this.框.style.height = '100vh'
      this.框.style.left = '0'
      this.框.style.top = '0'
      this.框.style.transform = 'none'
      this.遮罩.style.justifyContent = 'flex-start'
      this.遮罩.style.alignItems = 'flex-start'
      this.内容.style.width = '100%'
      this.内容.style.height = `calc(100vh - ${this.头部高度}px)`
      this.最大化按钮.设置文本('🗗')
      this.最大化按钮.设置标题('还原')
      this.是否最大化 = true
    } else {
      let 宽度 = 选项.宽度 ?? '60vw'
      let 高度 = 选项.高度 ?? '60vh'
      this.框.style.width = 宽度
      this.框.style.height = 高度
      this.框.style.left = ''
      this.框.style.top = ''
      this.框.style.transform = ''
      this.遮罩.style.justifyContent = 'center'
      this.遮罩.style.alignItems = 'center'
      this.内容.style.width = 宽度
      this.内容.style.height = 高度
      this.最大化按钮.设置文本('□')
      this.最大化按钮.设置标题('最大化')
      this.是否最大化 = false
    }

    // 显示遮罩
    this.遮罩.style.display = 'flex'

    // 绑定键盘事件
    this.键盘处理器 = async (e: KeyboardEvent): Promise<void> => {
      if (e.key === 'Escape' && 选项.可关闭 !== false) {
        await this.关闭()
      }
    }
    document.onkeydown = this.键盘处理器
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

    // 停止观察
    if (this.resize观察器 !== null) {
      this.resize观察器.disconnect()
      this.resize观察器 = null
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
