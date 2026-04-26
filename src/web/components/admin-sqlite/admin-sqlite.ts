import { 组件基类 } from '../../base/base'
import { 横向tab组件 } from '../general/tabs/tabs-horizontal'
import { 检查登录组件 } from '../process/login-check'
import { 设置调试组件 } from '../process/set-debug'
import { 设置网页全屏组件 } from '../process/set-html-full'
import { 设置主题组件 } from '../process/set-theme'
import { 数据库备份组件 } from './admin-sqlite-backup-database'
import { 数据库信息组件 } from './admin-sqlite-database-info'
import { 数据库管理组件 } from './admin-sqlite-database-manager'
import { 数据库执行查询组件 } from './admin-sqlite-execute-query'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 数据库管理页面组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-admin-sqlite', this)
  }

  private 标签页容器: 横向tab组件 | null = null

  public constructor() {
    super()
  }

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(new 设置主题组件())
    this.shadow.append(new 设置调试组件({ 排除事件: 'mousemove,mouseenter,mouseleave,scroll' }))
    this.shadow.append(new 设置网页全屏组件())
    this.shadow.append(new 检查登录组件())

    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    this.标签页容器 = new 横向tab组件()

    // 数据库信息标签页
    this.标签页容器.添加标签页({ 标签: '数据库信息' }, new 数据库信息组件())

    // 数据库管理标签页
    this.标签页容器.添加标签页({ 标签: '数据库管理' }, new 数据库管理组件())

    // 查询标签页
    this.标签页容器.添加标签页({ 标签: '查询' }, new 数据库执行查询组件())

    // 备份数据库标签页
    this.标签页容器.添加标签页({ 标签: '备份数据库' }, new 数据库备份组件())

    this.shadow.appendChild(this.标签页容器)
  }
}
