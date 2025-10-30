import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types'
import { 测试任务组件 } from './instant-job'
import { 定时任务组件 } from './scheduled-job'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 任务管理主组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-job-admin-main', this)
  }

  private 当前标签 = '即时任务'
  private 标签按钮容器 = document.createElement('div')
  private 内容容器 = document.createElement('div')
  private 即时任务组件 = new 测试任务组件({})
  private 定时任务组件 = new 定时任务组件({})

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'
    this.获得宿主样式().height = '100%'
    this.获得宿主样式().display = 'flex'
    this.获得宿主样式().flexDirection = 'column'

    // 创建标签按钮容器
    this.标签按钮容器.style.display = 'flex'
    this.标签按钮容器.style.borderBottom = '1px solid var(--边框颜色)'
    this.标签按钮容器.style.marginBottom = '1em'

    // 即时任务标签按钮
    let 即时任务按钮 = document.createElement('button')
    即时任务按钮.textContent = '即时任务'
    即时任务按钮.style.padding = '0.5em 1em'
    即时任务按钮.style.border = 'none'
    即时任务按钮.style.borderBottom = '2px solid var(--强调按钮背景)'
    即时任务按钮.style.backgroundColor = 'transparent'
    即时任务按钮.style.color = 'var(--文字颜色)'
    即时任务按钮.style.cursor = 'pointer'
    即时任务按钮.onclick = (): void => {
      this.切换标签('即时任务')
    }

    // 定时任务标签按钮
    let 定时任务按钮 = document.createElement('button')
    定时任务按钮.textContent = '定时任务'
    定时任务按钮.style.padding = '0.5em 1em'
    定时任务按钮.style.border = 'none'
    定时任务按钮.style.borderBottom = '2px solid transparent'
    定时任务按钮.style.backgroundColor = 'transparent'
    定时任务按钮.style.color = 'var(--文字颜色)'
    定时任务按钮.style.cursor = 'pointer'
    定时任务按钮.onclick = (): void => {
      this.切换标签('定时任务')
    }

    this.标签按钮容器.append(即时任务按钮, 定时任务按钮)

    // 内容容器
    this.内容容器.style.flex = '1'
    this.内容容器.style.overflow = 'auto'

    // 初始显示即时任务
    this.内容容器.appendChild(this.即时任务组件)

    this.shadow.appendChild(this.标签按钮容器)
    this.shadow.appendChild(this.内容容器)
  }

  private 切换标签(标签: string): void {
    if (this.当前标签 === 标签) {
      return
    }

    this.当前标签 = 标签

    // 更新按钮样式
    let 按钮们 = this.标签按钮容器.querySelectorAll('button')
    按钮们.forEach((按钮, 索引) => {
      if ((索引 === 0 && 标签 === '即时任务') || (索引 === 1 && 标签 === '定时任务')) {
        按钮.style.borderBottom = '2px solid var(--强调按钮背景)'
      } else {
        按钮.style.borderBottom = '2px solid transparent'
      }
    })

    // 切换内容
    this.内容容器.innerHTML = ''
    if (标签 === '即时任务') {
      this.内容容器.appendChild(this.即时任务组件)
    } else if (标签 === '定时任务') {
      this.内容容器.appendChild(this.定时任务组件)
    }
  }
}
