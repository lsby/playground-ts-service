import { 联合转元组 } from '../../../../tools/types'
import { 组件基类 } from '../../../base/base'
import { 创建元素 } from '../../../global/tools/create-element'
import { 文本按钮 } from '../base/base-button'

type 属性类型 = { 路由键?: string }
export type tabHorizontal发出事件类型 = { 切换: { 当前索引: number } }
type 监听事件类型 = {}

export class 横向tab组件 extends 组件基类<属性类型, tabHorizontal发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['路由键']
  static {
    this.注册组件('lsby-tabs-horizontal', this)
  }

  private 当前索引: number = 0
  private 标签头容器: HTMLDivElement = 创建元素('div')
  private 插槽容器: HTMLDivElement = 创建元素('div')

  public constructor(属性: 属性类型) {
    super(属性)
  }

  public override async 刷新(): Promise<void> {
    await super.刷新()
    let 标签元素列表 = Array.from(this.children).filter(
      (子): 子 is HTMLElement => 子 instanceof HTMLElement && 子.hasAttribute('标签'),
    )
    let 目标元素 = 标签元素列表[this.当前索引]
    if (目标元素 !== undefined) {
      if (目标元素 instanceof 组件基类) await 目标元素.刷新()
      for (let 子 of Array.from(目标元素.children)) if (子 instanceof 组件基类) await 子.刷新()
    }
  }

  protected override async 当加载时(): Promise<void> {
    let 路由键 = await this.获得属性('路由键')
    if (typeof 路由键 === 'string') {
      let params = new URLSearchParams(window.location.search)
      let 索引字符串 = params.get(路由键)
      if (索引字符串 !== null) {
        let 索引 = parseInt(索引字符串)
        let 子元素 = Array.from(this.children).filter((子): 子 is HTMLElement => 子 instanceof HTMLElement)
        let 标签元素数量 = 子元素.filter((el) => el.hasAttribute('标签')).length
        if (Number.isNaN(索引) === false && 索引 >= 0 && 索引 < 标签元素数量) {
          this.当前索引 = 索引
        }
      }
    }

    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    let 滚动条样式 = 创建元素('style', {
      textContent: `
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
    `,
    })
    this.shadow.appendChild(滚动条样式)

    this.标签头容器.style.display = 'flex'
    this.标签头容器.style.borderBottom = '1px solid var(--边框颜色)'
    this.标签头容器.style.gap = '10px'
    this.标签头容器.style.overflowX = 'auto'
    this.标签头容器.style.flexShrink = '0'
    // 隐藏滚动条但保留滚动功能
    this.标签头容器.style.scrollbarWidth = 'none' // Firefox
    // @ts-ignore
    this.标签头容器.style.msOverflowStyle = 'none' // IE/Edge

    this.插槽容器.style.flex = '1'
    this.插槽容器.style.display = 'flex'
    this.插槽容器.style.flexDirection = 'column'
    this.插槽容器.style.overflow = 'hidden'

    let 插槽: HTMLSlotElement = 创建元素('slot')
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
      let 按钮 = new 文本按钮({
        文本: 标签名,
        元素样式: {
          padding: '6px 12px',
          border: 'none',
          borderBottom: idx === this.当前索引 ? '2px solid var(--主色调)' : 'none',
          background: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          color: 'var(--文字颜色)',
        },
        点击处理函数: async (): Promise<void> => {
          await this.切换标签(idx)
        },
      })

      this.标签头容器.appendChild(按钮)
    })

    标签元素.forEach((el, idx) => {
      if (idx === this.当前索引) {
        el.style.display = 'flex'
        el.style.flex = '1'
        el.style.flexDirection = 'column'
        el.style.minHeight = '0'
        el.style.minWidth = '0'
        el.style.overflow = 'hidden'
      } else {
        el.style.display = 'none'
      }
    })
  }

  private async 切换标签(index: number): Promise<void> {
    let 标签元素列表 = Array.from(this.children).filter(
      (子): 子 is HTMLElement => 子 instanceof HTMLElement && 子.hasAttribute('标签'),
    )
    let 目标元素 = 标签元素列表[index]

    if (this.当前索引 !== index) {
      this.当前索引 = index
      this.更新UI()

      let 路由键 = await this.获得属性('路由键')
      if (typeof 路由键 === 'string') {
        let params = new URLSearchParams(window.location.search)
        params.set(路由键, index.toString())
        let newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
        window.history.replaceState(null, '', newUrl)
      }
      this.派发事件('切换', { 当前索引: index })
    }

    if (目标元素 !== undefined) {
      if (目标元素 instanceof 组件基类) await 目标元素.刷新()
      for (let 子 of Array.from(目标元素.children)) if (子 instanceof 组件基类) await 子.刷新()
    }
  }

  public async 设置当前索引(index: number): Promise<void> {
    await this.切换标签(index)
  }
}
