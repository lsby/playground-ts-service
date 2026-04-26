import { 组件基类 } from '../../base/base'
import { tabHorizontal发出事件类型, 横向tab组件 } from '../general/tabs/tabs-horizontal'
import { 检查登录组件 } from '../process/login-check'
import { 设置调试组件 } from '../process/set-debug'
import { 设置网页全屏组件 } from '../process/set-html-full'
import { 设置主题组件 } from '../process/set-theme'
import { 即时任务管理组件 } from './admin-job-instant'
import { 定时任务管理组件 } from './admin-job-scheduled'

type 发出事件类型 = {}
type 监听事件类型 = {} & tabHorizontal发出事件类型

export class 任务管理页面组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-admin-job', this)
  }

  private tabs = new 横向tab组件()
  private 即时任务组件 = new 即时任务管理组件()
  private 定时任务组件 = new 定时任务管理组件()

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(new 设置主题组件())
    this.shadow.append(new 设置调试组件({ 排除事件: 'mousemove,mouseenter,mouseleave,scroll' }))
    this.shadow.append(new 设置网页全屏组件())
    this.shadow.append(new 检查登录组件())

    this.获得宿主样式().width = '100%'
    this.获得宿主样式().height = '100%'

    // 添加到 tabs
    this.tabs.添加标签页({ 标签: '即时任务' }, this.即时任务组件)
    this.tabs.添加标签页({ 标签: '定时任务' }, this.定时任务组件)

    this.监听冒泡事件('切换', async (e: CustomEvent<{ 当前索引: number }>) => {
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
      void this.tabs.设置当前索引(1)
    }
  }
}
