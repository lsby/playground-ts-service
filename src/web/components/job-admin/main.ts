import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'
import { LsbyTabsHorizontal, tabHorizontal发出事件类型 } from '../general/tabs-horizontal'
import { 测试任务组件 } from './instant-job'
import { 定时任务组件 } from './scheduled-job'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {} & tabHorizontal发出事件类型

export class 任务管理主组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-job-admin-main', this)
  }

  private tabs = new LsbyTabsHorizontal({})
  private 即时任务组件 = new 测试任务组件({})
  private 定时任务组件 = new 定时任务组件({})

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'
    this.获得宿主样式().height = '100%'

    // 创建即时任务容器
    let 即时任务容器 = 创建元素('div')
    即时任务容器.setAttribute('标签', '即时任务')
    即时任务容器.appendChild(this.即时任务组件)

    // 创建定时任务容器
    let 定时任务容器 = 创建元素('div')
    定时任务容器.setAttribute('标签', '定时任务')
    定时任务容器.appendChild(this.定时任务组件)

    // 添加到 tabs
    this.tabs.appendChild(即时任务容器)
    this.tabs.appendChild(定时任务容器)
    this.监听事件('切换', async (e: CustomEvent<{ 当前索引: number }>) => {
      let type = e.detail.当前索引 === 0 ? 'instant' : 'scheduled'
      let url = new URL(window.location.href)
      url.searchParams.set('type', type)
      window.history.replaceState(null, '', url.pathname + url.search)
    })

    this.shadow.appendChild(this.tabs)

    // 检查 URL 参数，设置初始索引
    let urlParams = new URLSearchParams(window.location.search)
    let type = urlParams.get('type')
    if (type === 'scheduled') {
      this.tabs.设置当前索引(1)
    }
  }
}
