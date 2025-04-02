import { 组件基类 } from '../base/base'
import { 联合转元组 } from '../global/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

/**
 * 一个容器, 用于flex布局的项目元素:
 *
 * - 内部元素横纵都居中
 * - 占据所在位置的剩余空间
 */
export class LsbyFlexItemContainer extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-flex-item-container', this)
  }

  constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()

    style.display = 'flex' // 启用 Flexbox 布局
    style.flexDirection = 'column' // 默认纵向排列
    style.justifyContent = 'center' // 居中对齐
    style.alignItems = 'center' // 水平方向居中
    style.width = '100%' // 容器宽度占满父元素
    style.height = '100%' // 容器高度占满父元素
    style.overflow = 'hidden' // 防止内容溢出
    style.flexGrow = '1' // 放大比例
    style.flexShrink = '1' // 缩小比例
    style.flexBasis = 'auto' // 占据主轴大小

    let 插槽: HTMLSlotElement = document.createElement('slot')

    this.shadow.appendChild(插槽)
  }
}
