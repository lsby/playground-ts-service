import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {}
type 发出事件类型 = {
  切换: { 当前索引: number }
}
type 监听事件类型 = {}

export class LsbyTabsVertical extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-tabs-vertical', this)
  }

  private 当前索引: number = 0
  private 标签头容器: HTMLDivElement = document.createElement('div')
  private 插槽容器: HTMLDivElement = document.createElement('div')

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'row'
    style.width = '100%'
    style.height = '100%'

    let 滚动条样式 = document.createElement('style')
    滚动条样式.textContent = `
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: var(--背景颜色);
      }
      ::-webkit-scrollbar-thumb {
        background: var(--边框颜色);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--主色调);
      }
    `
    this.shadow.appendChild(滚动条样式)

    this.标签头容器.style.display = 'flex'
    this.标签头容器.style.flexDirection = 'column'
    this.标签头容器.style.borderRight = '1px solid var(--边框颜色)'
    this.标签头容器.style.gap = '10px'
    this.标签头容器.style.minWidth = '100px'

    this.插槽容器.style.flex = '1'
    this.插槽容器.style.display = 'flex'
    this.插槽容器.style.flexDirection = 'column'
    this.插槽容器.style.overflow = 'hidden'

    let 插槽: HTMLSlotElement = document.createElement('slot')
    this.插槽容器.appendChild(插槽)

    this.shadow.appendChild(this.标签头容器)
    this.shadow.appendChild(this.插槽容器)

    this.更新UI()
  }

  private 更新UI(): void {
    let 子元素 = Array.from(this.children).filter((子): 子 is HTMLElement => 子 instanceof HTMLElement)
    let 标签元素 = 子元素.filter((el) => el.hasAttribute('标签'))

    this.标签头容器.innerHTML = ''

    标签元素.forEach((el, idx) => {
      let 标签名 = el.getAttribute('标签') ?? `标签${idx}`
      let 按钮 = document.createElement('button')

      按钮.textContent = 标签名
      按钮.style.padding = '6px 12px'
      按钮.style.border = 'none'
      按钮.style.borderLeft = idx === this.当前索引 ? '2px solid var(--主色调)' : 'none'
      按钮.style.background = 'none'
      按钮.style.cursor = 'pointer'
      按钮.style.textAlign = 'left'
      按钮.style.userSelect = 'none'
      按钮.style.color = 'var(--文字颜色)'

      按钮.onclick = (): void => this.切换标签(idx)

      this.标签头容器.appendChild(按钮)
    })

    标签元素.forEach((el, idx) => {
      if (idx === this.当前索引) {
        el.style.display = 'flex'
        el.style.flex = '1'
      } else {
        el.style.display = 'none'
      }
    })
  }

  private 切换标签(index: number): void {
    if (this.当前索引 === index) return
    this.当前索引 = index
    this.更新UI()
  }
}
