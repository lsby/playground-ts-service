import { 联合转元组 } from '../../../tools/types'
import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/tools/create-element'
import { 横向tab组件 } from '../general/tabs/tabs-horizontal'
import { 数据库备份组件 } from './admin-sqlite-backup-database'
import { 数据库信息组件 } from './admin-sqlite-database-info'
import { 数据库管理组件 } from './admin-sqlite-database-manager'
import { 数据库执行查询组件 } from './admin-sqlite-execute-query'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 数据库管理组件实例 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-sqlite-admin', this)
  }

  private 标签页容器: HTMLElement | null = null

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.width = '100%'
    style.height = '100%'

    this.标签页容器 = new 横向tab组件({})

    // 数据库信息标签页
    let 数据库信息容器 = 创建元素('div')
    数据库信息容器.setAttribute('标签', '数据库信息')
    let 数据库信息组件实例 = new 数据库信息组件({})
    数据库信息容器.appendChild(数据库信息组件实例)
    this.标签页容器.appendChild(数据库信息容器)

    // 数据库管理标签页
    let 数据库管理容器 = 创建元素('div')
    数据库管理容器.setAttribute('标签', '数据库管理')
    let 数据库管理组件实例 = new 数据库管理组件({})
    数据库管理容器.appendChild(数据库管理组件实例)
    this.标签页容器.appendChild(数据库管理容器)

    // 查询标签页
    let 查询容器 = 创建元素('div')
    查询容器.setAttribute('标签', '查询')
    let 查询组件 = new 数据库执行查询组件({})
    查询容器.appendChild(查询组件)
    this.标签页容器.appendChild(查询容器)

    // 备份数据库标签页
    let 备份数据库容器 = 创建元素('div')
    备份数据库容器.setAttribute('标签', '备份数据库')
    let 备份数据库组件 = new 数据库备份组件({})
    备份数据库容器.appendChild(备份数据库组件)
    this.标签页容器.appendChild(备份数据库容器)

    this.shadow.appendChild(this.标签页容器)
  }
}
