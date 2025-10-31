import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

/**
 * 容器
 * 需要一个占满横纵的空间时使用
 */
export class LsbyContainer extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-container', this)
  }

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()

    style.display = 'flex' // 启用 Flexbox 布局
    style.flexDirection = 'column' // 默认纵向排列
    style.justifyContent = 'center' // 居中对齐
    style.alignItems = 'center' // 水平方向居中
    style.overflow = 'hidden' // 防止内容溢出
    style.width = '100%' // 容器宽度占满父元素
    style.height = '100%' // 容器高度占满父元素

    let 插槽: HTMLSlotElement = document.createElement('slot')

    this.shadow.appendChild(插槽)
  }
}
