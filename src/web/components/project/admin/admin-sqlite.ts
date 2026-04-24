import { 组件基类 } from '../../../base/base'
import { 数据库管理组件实例 } from '../../admin-sqlite/admin-sqlite'
import { 检查登录组件 } from '../../process/login-check'
import { 设置调试组件 } from '../../process/set-debug'
import { 设置网页全屏组件 } from '../../process/set-html-full'
import { 设置主题组件 } from '../../process/set-theme'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 数据库管理页面组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-admin-sqlite', this)
  }

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(new 设置主题组件())
    this.shadow.append(new 设置调试组件({ 排除事件: 'mousemove,mouseenter,mouseleave,scroll' }))
    this.shadow.append(new 设置网页全屏组件())
    this.shadow.append(new 检查登录组件())
    this.shadow.append(new 数据库管理组件实例())
  }
}
