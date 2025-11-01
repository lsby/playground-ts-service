import { 组件基类 } from '../../base/base'
import { 联合转元组 } from '../../global/types/types'
import { LsbyBackupDatabase } from './backup-database'
import { LsbyDatabaseInfo } from './database-info'
import { LsbyDatabaseManager } from './database-manager'
import { LsbyExecuteQuery } from './execute-query'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbySqliteAdminMain extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-sqlite-admin-main', this)
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

    this.标签页容器 = document.createElement('lsby-tabs-horizontal')

    // 数据库信息标签页
    let 数据库信息容器 = document.createElement('div')
    数据库信息容器.setAttribute('标签', '数据库信息')
    let 数据库信息组件 = new LsbyDatabaseInfo({})
    数据库信息容器.appendChild(数据库信息组件)
    this.标签页容器.appendChild(数据库信息容器)

    // 数据库管理标签页
    let 数据库管理容器 = document.createElement('div')
    数据库管理容器.setAttribute('标签', '数据库管理')
    let 数据库管理组件 = new LsbyDatabaseManager({})
    数据库管理容器.appendChild(数据库管理组件)
    this.标签页容器.appendChild(数据库管理容器)

    // 查询标签页
    let 查询容器 = document.createElement('div')
    查询容器.setAttribute('标签', '查询')
    let 查询组件 = new LsbyExecuteQuery({})
    查询容器.appendChild(查询组件)
    this.标签页容器.appendChild(查询容器)

    // 备份数据库标签页
    let 备份数据库容器 = document.createElement('div')
    备份数据库容器.setAttribute('标签', '备份数据库')
    let 备份数据库组件 = new LsbyBackupDatabase({})
    备份数据库容器.appendChild(备份数据库组件)
    this.标签页容器.appendChild(备份数据库容器)

    this.shadow.appendChild(this.标签页容器)
  }
}
