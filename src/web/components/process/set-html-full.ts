import { 组件基类 } from '../../base/base'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 设置网页全屏组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-set-html-full', this)
  }

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    document.body.style.margin = '0px'
    document.body.style.height = '100%'
    document.body.style.width = '100%'
    document.documentElement.style.height = '100dvh'
    document.documentElement.style.width = '100%'
    // 兼容不支持 dvh 的旧版浏览器
    if (CSS.supports('height: 100dvh') === false) {
      document.documentElement.style.height = '-webkit-fill-available'
    }
  }
}
