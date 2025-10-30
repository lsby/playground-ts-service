import { 组件基类 } from '../../base/base'

type 属性类型 = {
  显示: '是' | '否'
  标题: string
}
export type 模态框发出事件类型 = {
  关闭: void
}
type 监听事件类型 = {}

export class 模态框组件 extends 组件基类<属性类型, 模态框发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = ['显示', '标题']

  static {
    this.注册组件('lsby-modal', this)
  }

  private 遮罩 = document.createElement('div')
  private 框 = document.createElement('div')
  private 头部 = document.createElement('div')
  private 内容 = document.createElement('div')

  protected override async 当变化时(属性名: keyof 属性类型, 旧值: string, 新值: string): Promise<void> {
    switch (属性名) {
      case '显示':
        this.遮罩.style.display = 新值 === '是' ? 'flex' : 'none'
        break
      case '标题':
        let 标题元素 = this.头部.querySelector('span')
        if (标题元素 !== null) {
          标题元素.textContent = 新值
        }
        break
    }
  }

  protected override async 当加载时(): Promise<void> {
    document.addEventListener('keydown', async (e): Promise<void> => {
      if (e.key === 'Escape' && this.遮罩.style.display !== 'none') {
        this.派发事件('关闭', void 0)
        await this.设置属性('显示', '否')
      }
    })

    // 遮罩
    this.遮罩.style.position = 'fixed'
    this.遮罩.style.left = '0'
    this.遮罩.style.top = '0'
    this.遮罩.style.width = '100vw'
    this.遮罩.style.height = '100vh'
    this.遮罩.style.background = 'var(--遮罩颜色)'
    this.遮罩.style.display = 'none'
    this.遮罩.style.justifyContent = 'center'
    this.遮罩.style.alignItems = 'center'
    this.遮罩.style.zIndex = '999'

    // this.遮罩.onclick = (e): void => {
    //   if (e.target === this.遮罩) {
    //     this.派发事件('关闭', void 0)
    //     this.设置属性('显示', '否')
    //   }
    // }

    // 框
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
    this.头部.style.height = '32px'
    this.头部.style.background = 'var(--按钮背景)'
    this.头部.style.display = 'flex'
    this.头部.style.alignItems = 'center'
    this.头部.style.padding = '0 8px'
    this.头部.style.justifyContent = 'space-between'

    let 标题 = document.createElement('span')
    let 标题值 = await this.获得属性('标题')
    if (标题值 !== null) {
      标题.textContent = 标题值
    } else {
      标题.textContent = '模态框'
    }
    this.头部.appendChild(标题)

    let 关闭按钮 = document.createElement('button')
    关闭按钮.textContent = '✕'
    关闭按钮.style.border = 'none'
    关闭按钮.style.background = 'transparent'
    关闭按钮.style.cursor = 'pointer'
    关闭按钮.style.fontSize = '16px'
    关闭按钮.style.color = 'red'
    关闭按钮.style.fontWeight = 'bold'
    关闭按钮.onclick = async (): Promise<void> => {
      this.派发事件('关闭', void 0)
      await this.设置属性('显示', '否')
    }
    this.头部.appendChild(关闭按钮)

    // 内容
    this.内容.style.padding = '8px'
    this.内容.style.flex = '1'
    this.内容.style.overflow = 'auto'
    this.内容.style.maxHeight = '90vh'
    let slot = document.createElement('slot')
    this.内容.appendChild(slot)

    this.框.appendChild(this.头部)
    this.框.appendChild(this.内容)
    this.遮罩.appendChild(this.框)
    this.shadow.appendChild(this.遮罩)
  }

  public 设置内容(内容: HTMLElement): void {
    while (this.内容.firstChild !== null) {
      this.内容.removeChild(this.内容.firstChild)
    }
    this.内容.appendChild(内容)
  }
}
