import { 联合转元组 } from '../../../../tools/types'
import { 组件基类 } from '../../../base/base'
import { 创建元素 } from '../../../global/tools/create-element'

type 属性类型 = { 路由键?: string }
export type appNavigation发出事件类型 = { 切换: { 当前索引: number } }
type 监听事件类型 = {}

export class App导航组件 extends 组件基类<属性类型, appNavigation发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = ['路由键']
  static {
    this.注册组件('lsby-app-navigation', this)
  }

  private 当前索引: number = 0
  private 导航栏容器: HTMLDivElement = 创建元素('div')
  private 内容容器: HTMLDivElement = 创建元素('div')
  private 是移动端: boolean = false

  public constructor(属性: 属性类型) {
    super(属性)
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

    this.是移动端 = window.matchMedia('(max-width: 768px)').matches
    window.matchMedia('(max-width: 768px)').onchange = (e): void => {
      this.是移动端 = e.matches
      this.更新布局()
    }

    this.初始化结构()
    this.更新布局()
    this.更新UI()
  }

  private 初始化结构(): void {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.width = '100%'
    style.height = '100%'
    style.overflow = 'hidden'

    this.导航栏容器.style.display = 'flex'
    this.导航栏容器.style.backgroundColor = 'var(--背景颜色)'
    this.导航栏容器.style.zIndex = '10'

    this.内容容器.style.flex = '1'
    this.内容容器.style.display = 'flex'
    this.内容容器.style.flexDirection = 'column'
    this.内容容器.style.overflow = 'hidden'

    let 插槽: HTMLSlotElement = 创建元素('slot')
    this.内容容器.appendChild(插槽)

    this.shadow.appendChild(this.导航栏容器)
    this.shadow.appendChild(this.内容容器)
  }

  private 更新布局(): void {
    let style = this.获得宿主样式()
    if (this.是移动端 === true) {
      style.flexDirection = 'column-reverse'
      this.导航栏容器.style.flexDirection = 'row'
      this.导航栏容器.style.height = '60px'
      this.导航栏容器.style.width = '100%'
      this.导航栏容器.style.borderTop = '1px solid var(--边框颜色)'
      this.导航栏容器.style.borderRight = 'none'
      this.导航栏容器.style.justifyContent = 'space-around'
      this.导航栏容器.style.padding = '0'
    } else {
      style.flexDirection = 'row'
      this.导航栏容器.style.flexDirection = 'column'
      this.导航栏容器.style.width = '120px'
      this.导航栏容器.style.height = '100%'
      this.导航栏容器.style.borderRight = '1px solid var(--边框颜色)'
      this.导航栏容器.style.borderTop = 'none'
      this.导航栏容器.style.justifyContent = 'flex-start'
      this.导航栏容器.style.padding = '20px 0'
      this.导航栏容器.style.gap = '10px'
    }
    this.更新UI()
  }

  private 更新UI(): void {
    let 子元素 = Array.from(this.children).filter((子): 子 is HTMLElement => 子 instanceof HTMLElement)
    let 标签元素 = 子元素.filter((el) => el.hasAttribute('标签'))

    this.导航栏容器.innerHTML = ''

    标签元素.forEach((el, idx) => {
      let 标签名 = el.getAttribute('标签') ?? `标签${idx}`
      let 图标 = el.getAttribute('图标') ?? ''
      let 选中 = idx === this.当前索引

      let 按钮 = 创建元素('button', {
        style: {
          padding: this.是移动端 ? '8px 0' : '10px 20px',
          border: 'none',
          borderLeft: this.是移动端 === false && 选中 === true ? '3px solid var(--主色调)' : 'none',
          borderTop: this.是移动端 === true && 选中 === true ? '3px solid var(--主色调)' : 'none',
          background: 选中 === true ? 'var(--主色调-极淡)' : 'none',
          cursor: 'pointer',
          textAlign: 'center',
          userSelect: 'none',
          color: 选中 === true ? 'var(--主色调)' : 'var(--文字颜色)',
          width: this.是移动端 ? 'auto' : '100%',
          flex: this.是移动端 ? '1' : 'none',
          display: 'flex',
          flexDirection: this.是移动端 ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: this.是移动端 ? 'center' : 'flex-start',
          gap: this.是移动端 ? '2px' : '12px',
          transition: 'all 0.2s',
          outline: 'none',
          fontFamily: 'inherit',
        },
      })

      if (图标 !== '') {
        let 图标元素 = 创建元素('span', {
          textContent: 图标,
          style: { fontSize: this.是移动端 ? '20px' : '18px', lineHeight: '1' },
        })
        按钮.appendChild(图标元素)
      }

      let 文字元素 = 创建元素('span', {
        textContent: 标签名,
        style: { fontSize: this.是移动端 ? '12px' : '16px', fontWeight: 选中 === true ? '600' : '400' },
      })
      按钮.appendChild(文字元素)

      按钮.onclick = async (): Promise<void> => {
        await this.切换标签(idx)
      }

      this.导航栏容器.appendChild(按钮)
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

      if (目标元素 !== undefined) {
        if (目标元素 instanceof 组件基类) await 目标元素.刷新()
        for (let 子 of Array.from(目标元素.children)) if (子 instanceof 组件基类) await 子.刷新()
      }
    }
  }

  public async 设置当前索引(index: number): Promise<void> {
    await this.切换标签(index)
  }
}
