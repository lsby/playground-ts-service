import { 创建元素 } from '../tools/create-element'

export type 右键菜单项 = { 文本: string; 回调: () => Promise<void> } | '分隔符'

export class 右键菜单管理器 {
  private static 实例: 右键菜单管理器 | null = null

  public static 获得实例(): 右键菜单管理器 {
    if (this.实例 === null) this.实例 = new 右键菜单管理器()
    return this.实例
  }

  private 当前菜单容器: HTMLDivElement | null = null
  private 当前关闭回调: (() => void) | null = null

  private constructor() {}

  public 显示菜单(x: number, y: number, 菜单项列表: 右键菜单项[], 关闭回调?: () => void): void {
    this.隐藏菜单()
    this.当前关闭回调 = 关闭回调 ?? null

    // 创建菜单容器
    let 菜单容器 = 创建元素('div', {
      style: {
        position: 'fixed',
        backgroundColor: 'var(--主要背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '8px',
        padding: '6px 0',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        zIndex: '10000',
        minWidth: '160px',
        backdropFilter: 'blur(8px)',
      },
    })

    for (let 菜单项 of 菜单项列表) {
      if (菜单项 === '分隔符') {
        let 分隔符 = 创建元素('div', {
          style: { height: '1px', backgroundColor: 'var(--边框颜色)', margin: '4px 0', opacity: '0.5' },
        })
        菜单容器.appendChild(分隔符)
        continue
      }

      let 项元素 = 创建元素('div', {
        className: 'context-menu-item',
        textContent: 菜单项.文本,
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

    document.body.appendChild(菜单容器)
    this.当前菜单容器 = 菜单容器

    let 宽度 = 菜单容器.offsetWidth
    let 高度 = 菜单容器.offsetHeight
    let 视口宽度 = window.innerWidth
    let 视口高度 = window.innerHeight

    let 最终X = x
    let 最终Y = y

    if (最终X + 宽度 > 视口宽度) {
      最终X = 视口宽度 - 宽度 - 4
    }
    if (最终Y + 高度 > 视口高度) {
      最终Y = 视口高度 - 高度 - 4
    }

    if (最终X < 0) 最终X = 4
    if (最终Y < 0) 最终Y = 4

    菜单容器.style.left = `${最终X}px`
    菜单容器.style.top = `${最终Y}px`

    let 处理关闭 = (事件: Event): void => {
      // 如果点击的是菜单容器内部，不关闭
      if (菜单容器.contains(事件.target as Node) === true) {
        return
      }
      this.隐藏菜单()
    }

    // 使用 setTimeout 将监听器注册推迟到下一个事件循环
    // 这样可以防止当前冒泡到 document 的 contextmenu/mousedown 事件立即触发关闭
    setTimeout(() => {
      document.onmousedown = (事件: MouseEvent): void => {
        处理关闭(事件 as Event)
      }

      document.oncontextmenu = (事件: MouseEvent): void => {
        处理关闭(事件 as Event)
      }
    }, 0)
  }

  public 隐藏菜单(): void {
    if (this.当前菜单容器 !== null && document.body.contains(this.当前菜单容器) === true) {
      document.body.removeChild(this.当前菜单容器)
      this.当前菜单容器 = null
    }

    document.onmousedown = null
    document.oncontextmenu = null

    if (this.当前关闭回调 !== null) {
      let 回调 = this.当前关闭回调
      this.当前关闭回调 = null
      回调()
    }
  }
}
