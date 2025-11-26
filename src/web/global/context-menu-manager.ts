import { 创建元素 } from './create-element'

export type 右键菜单项 = {
  文本: string
  回调: () => Promise<void>
}

export class 右键菜单管理器 {
  private static 实例: 右键菜单管理器 | null = null

  public static 获得实例(): 右键菜单管理器 {
    if (this.实例 === null) this.实例 = new 右键菜单管理器()
    return this.实例
  }

  private 当前菜单容器: HTMLDivElement | null = null
  private 当前关闭回调: ((事件: Event) => void) | null = null

  private constructor() {}

  public 显示菜单(x: number, y: number, 菜单项列表: 右键菜单项[]): void {
    this.隐藏菜单()

    // 创建菜单容器
    let 菜单容器 = 创建元素('div', {
      style: {
        position: 'fixed',
        backgroundColor: 'var(--主要背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        padding: '4px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: '10000',
        minWidth: '100px',
      },
    })

    for (let 菜单项 of 菜单项列表) {
      let 项元素 = 创建元素('div', {
        textContent: 菜单项.文本,
        style: {
          padding: '8px 16px',
          cursor: 'pointer',
          color: 'var(--文字颜色)',
        },
        onmouseenter: (): void => {
          项元素.style.backgroundColor = 'var(--次要背景颜色)'
        },
        onmouseleave: (): void => {
          项元素.style.backgroundColor = 'transparent'
        },
        onclick: async (): Promise<void> => {
          try {
            await 菜单项.回调()
          } finally {
            this.隐藏菜单()
          }
        },
      })
      菜单容器.appendChild(项元素)
    }

    菜单容器.style.left = `${x}px`
    菜单容器.style.top = `${y}px`
    document.body.appendChild(菜单容器)

    this.当前菜单容器 = 菜单容器

    let 关闭菜单 = (事件: Event): void => {
      // 如果点击的是菜单容器内部，不关闭
      if (菜单容器.contains(事件.target as Node) === true) {
        return
      }
      this.隐藏菜单()
    }

    this.当前关闭回调 = 关闭菜单

    // 也监听右键菜单事件，以防右键再次打开时关闭之前的菜单
    document.onmousedown = (事件: MouseEvent): void => {
      关闭菜单(事件 as Event)
    }

    document.oncontextmenu = (事件: MouseEvent): void => {
      关闭菜单(事件 as Event)
    }
  }

  public 隐藏菜单(): void {
    if (this.当前菜单容器 !== null && document.body.contains(this.当前菜单容器) === true) {
      document.body.removeChild(this.当前菜单容器)
      this.当前菜单容器 = null
    }

    if (this.当前关闭回调 !== null) {
      document.onmousedown = null
      document.oncontextmenu = null
      this.当前关闭回调 = null
    }
  }
}
