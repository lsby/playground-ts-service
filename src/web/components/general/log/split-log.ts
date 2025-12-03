import { 组件基类 } from '../../../base/base'
import { 创建元素 } from '../../../global/create-element'
import { LsbyLog } from './log'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbySplitLog extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-split-log', this)
  }

  public 日志实例: LsbyLog | null = null

  protected override async 当加载时(): Promise<void> {
    // 设置宿主元素为 flex 容器，占满父容器
    let hostStyle = this.获得宿主样式()
    hostStyle.display = 'flex'
    hostStyle.flexDirection = 'row'
    hostStyle.width = '100%'
    hostStyle.height = '100%'

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        width: '100%',
        gap: '10px',
      },
    })

    let 左侧插槽容器 = 创建元素('div', {
      style: {
        flex: '1',
        overflow: 'auto',
      },
    })

    let 左侧插槽 = 创建元素('slot')

    左侧插槽容器.appendChild(左侧插槽)

    let 右侧日志容器 = 创建元素('div', {
      style: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
      },
    })

    this.日志实例 = new LsbyLog()
    this.日志实例.style.flex = '1'
    右侧日志容器.appendChild(this.日志实例)

    容器.appendChild(左侧插槽容器)
    容器.appendChild(右侧日志容器)

    this.shadow.appendChild(容器)
  }

  public get 日志组件(): LsbyLog {
    if (this.日志实例 === null) {
      throw new Error('日志组件未初始化')
    }
    return this.日志实例
  }
}
