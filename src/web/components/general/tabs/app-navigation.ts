import { 组件基类 } from '../../../base/base'
import { 创建元素 } from '../../../global/tools/create-element'

type App导航配置 = { 路由键?: string | undefined }
export type appNavigation发出事件类型 = { 切换: { 当前索引: number } }
type 监听事件类型 = {}

type 标签页项 = { 标签: string; 图标?: string | undefined; 内容: HTMLElement }

export class App导航组件 extends 组件基类<appNavigation发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-app-navigation', this)
  }

  private 配置: App导航配置
  private 当前索引: number = 0
  private 导航栏容器: HTMLDivElement = 创建元素('div')
  private 内容容器: HTMLDivElement = 创建元素('div')
  private 是移动端: boolean = false
  private 标签页列表: 标签页项[] = []

  public constructor(配置: App导航配置 = {}) {
    super()
    this.配置 = 配置
  }

  public 添加标签页(配置: { 标签: string; 图标?: string | undefined }, 内容: HTMLElement): void {
    this.标签页列表.push({ 标签: 配置.标签, 图标: 配置.图标, 内容 })
    this.appendChild(内容)
  }

  protected override async 当加载时(): Promise<void> {
    let 路由键 = this.配置.路由键
    if (typeof 路由键 === 'string') {
      let params = new URLSearchParams(window.location.search)
      let 索引字符串 = params.get(路由键)
      if (索引字符串 !== null) {
        let 索引 = parseInt(索引字符串)
        if (Number.isNaN(索引) === false && 索引 >= 0 && 索引 < this.标签页列表.length) {
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
    this.导航栏容器.innerHTML = ''

    this.标签页列表.forEach((项, idx) => {
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

      if (项.图标 !== undefined && 项.图标 !== '') {
        let 图标元素 = 创建元素('span', {
          textContent: 项.图标,
          style: { fontSize: this.是移动端 ? '20px' : '18px', lineHeight: '1' },
        })
        按钮.appendChild(图标元素)
      }

      let 文字元素 = 创建元素('span', {
        textContent: 项.标签,
        style: { fontSize: this.是移动端 ? '12px' : '16px', fontWeight: 选中 === true ? '600' : '400' },
      })
      按钮.appendChild(文字元素)

      按钮.onclick = async (): Promise<void> => {
        await this.切换标签(idx)
      }

      this.导航栏容器.appendChild(按钮)
    })

    this.标签页列表.forEach((项, idx) => {
      if (idx === this.当前索引) {
        项.内容.style.display = 'flex'
        项.内容.style.flex = '1'
        项.内容.style.flexDirection = 'column'
        项.内容.style.minHeight = '0'
        项.内容.style.minWidth = '0'
        项.内容.style.overflow = 'hidden'
      } else {
        项.内容.style.display = 'none'
      }
    })
  }

  private async 切换标签(index: number): Promise<void> {
    let 目标项 = this.标签页列表[index]

    if (this.当前索引 !== index) {
      this.当前索引 = index
      this.更新UI()

      let 路由键 = this.配置.路由键
      if (typeof 路由键 === 'string') {
        let params = new URLSearchParams(window.location.search)
        params.set(路由键, index.toString())
        let newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
        window.history.replaceState(null, '', newUrl)
      }
      this.派发事件('切换', { 当前索引: index })

      if (目标项 !== undefined) {
        let 内容 = 目标项.内容
        if (内容 instanceof 组件基类) await 内容.刷新()
        for (let 子 of Array.from(内容.children)) if (子 instanceof 组件基类) await 子.刷新()
      }
    }
  }

  public async 设置当前索引(index: number): Promise<void> {
    await this.切换标签(index)
  }
}
