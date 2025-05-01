import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

/**
 * 纵向容器
 * 需要排版一整列时使用
 */
export class LsbyColumn extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-column', this)
  }

  constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()

    style.display = 'flex' // 启用 Flexbox 布局
    style.flexDirection = 'column' // 纵向排列
    style.justifyContent = 'space-around' // 垂直方向均匀分布
    style.alignItems = 'center' // 水平方向居中
    style.gap = '10px' // 设置元素间距
    style.height = '100%' // 容器高度占满父元素

    let 插槽: HTMLSlotElement = document.createElement('slot')

    this.shadow.appendChild(插槽)
  }
}
