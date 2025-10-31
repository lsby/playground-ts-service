import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types/types'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

/**
 * 横向容器
 * 需要排版一整行时使用
 */
export class LsbyRow extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-row', this)
  }

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()

    style.display = 'flex' // 启用 Flexbox 布局
    style.flexDirection = 'row' // 元素按行排列
    style.justifyContent = 'space-around' // 水平方向左对齐
    style.alignItems = 'center' // 垂直方向居中
    style.gap = '10px' // 设置元素间距
    style.width = '100%' // 容器宽度占满父元素

    let 插槽: HTMLSlotElement = document.createElement('slot')

    this.shadow.appendChild(插槽)
  }
}
