import { 创建元素 } from '../tools/create-element'

type 提示数据 = { html: string }

class 提示管理器内部 {
  private 浮窗元素?: HTMLDivElement
  private 当前目标?: HTMLElement

  private 初始化(): void {
    if (this.浮窗元素 !== undefined) return

    this.浮窗元素 = 创建元素('div', {
      style: {
        position: 'fixed',
        zIndex: '99999',
        backgroundColor: 'var(--背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        maxWidth: '350px',
        maxHeight: '80vh',
        overflowY: 'auto',
        display: 'none',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        color: 'var(--文字颜色)',
        fontSize: '14px',
        lineHeight: '1.6',
        transition: 'opacity 0.2s, transform 0.1s',
      },
    })

    // 给浮窗内的图片加默认样式
    let style = 创建元素('style', {
      textContent: `
        .lsby-hint-popover img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          display: block;
          margin: 4px 0;
        }
      `,
    })
    this.浮窗元素.classList.add('lsby-hint-popover')
    this.浮窗元素.appendChild(style)

    document.body.appendChild(this.浮窗元素)
  }

  public 显示(数据: 提示数据, 目标: HTMLElement): void {
    this.初始化()
    if (this.浮窗元素 === undefined) return

    this.当前目标 = 目标

    // 保留 style 标签
    let styleTag = this.浮窗元素.querySelector('style')
    this.浮窗元素.innerHTML = ''
    if (styleTag !== null) this.浮窗元素.appendChild(styleTag)

    let 内容容器 = 创建元素('div', { innerHTML: 数据.html })
    this.浮窗元素.appendChild(内容容器)

    // 如果里面有图片, 监听图片加载完成后重新更新位置
    let 图片们 = 内容容器.querySelectorAll('img')
    图片们.forEach((图片) => {
      图片.onload = (): void => {
        this.更新位置()
      }
    })

    this.浮窗元素.style.display = 'flex'
    // 初始透明度设为0，定位完成后再显示
    this.浮窗元素.style.opacity = '0'
    this.更新位置()

    // 强制重绘以触发动画
    void this.浮窗元素.offsetWidth
    this.浮窗元素.style.opacity = '1'
    this.浮窗元素.style.transform = 'translateY(0)'
  }

  public 隐藏(): void {
    if (this.浮窗元素 === undefined) return
    this.浮窗元素.style.opacity = '0'
    this.浮窗元素.style.transform = 'translateY(4px)'
    setTimeout(() => {
      if (this.浮窗元素 !== undefined && this.浮窗元素.style.opacity === '0') {
        this.浮窗元素.style.display = 'none'
      }
    }, 150)
  }

  private 更新位置(): void {
    if (this.浮窗元素 === undefined || this.当前目标 === undefined) return

    let 矩形 = this.当前目标.getBoundingClientRect()
    let 浮窗矩形 = this.浮窗元素.getBoundingClientRect()

    let top = 矩形.bottom + 8
    let left = 矩形.left

    // 左右溢出检查
    if (left + 浮窗矩形.width > window.innerWidth - 16) {
      left = window.innerWidth - 浮窗矩形.width - 16
    }
    if (left < 16) {
      left = 16
    }

    // 上下溢出检查
    if (top + 浮窗矩形.height > window.innerHeight - 16) {
      // 如果下方没位置了，尝试放到上方
      let 上方位置 = 矩形.top - 浮窗矩形.height - 8
      if (上方位置 > 16) {
        top = 上方位置
      } else {
        // 如果上方也没位置，就尽量靠上，并靠 max-height 保证不超出
        top = 16
      }
    }

    // 安全检查，确保不低于顶部
    if (top < 16) top = 16

    this.浮窗元素.style.top = `${top}px`
    this.浮窗元素.style.left = `${left}px`
  }
}

export let 提示管理器 = new 提示管理器内部()
