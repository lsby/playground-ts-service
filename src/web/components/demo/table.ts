import { 自定义操作, 自定义项操作, 表格组件基类 } from '../../base/table-base'
import { GlobalWeb } from '../../global/global'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}
type 数据项 = { id: string; name: string }

export class LsbyTable extends 表格组件基类<属性类型, 发出事件类型, 监听事件类型, 数据项> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-table', this)
  }

  private API管理器 = GlobalWeb.getItemSync('API管理器')

  protected override 映射显示字段名称(数据字段: keyof 数据项): string | null {
    switch (数据字段) {
      case 'id':
        return 'id'
      case 'name':
        return '名称'
    }
  }
  protected override async 请求数据(page: number, size: number): Promise<{ data: 数据项[]; total: number }> {
    return await this.API管理器.请求接口并处理错误('/api/user/select-user-list', { page, size })
  }
  protected override async 获得自定义操作(): Promise<自定义操作> {
    return {
      添加数据: async (): Promise<void> => {
        let name = prompt('请输入名称:')
        if (name === '' || name === null) return alert('未输入数据')
        let pwd = prompt('请输入密码:')
        if (pwd === '' || pwd === null) return alert('未输入数据')
        await this.API管理器.请求接口并处理错误('/api/user/add-user', { name: name, pwd: pwd })
      },
    }
  }
  protected override async 获得自定义项操作(): Promise<自定义项操作<数据项>> {
    return {
      删除: async (数据项: 数据项): Promise<void> => {
        if (confirm('你确定要删除这条数据吗？') === false) return
        await this.API管理器.请求接口并处理错误('/api/user/delete-user', { id: 数据项.id })
      },
      编辑: async (数据项: 数据项): Promise<void> => {
        let name = prompt('请输入新名称:')
        if (name === '' || name === null) return alert('未输入数据')
        await this.API管理器.请求接口并处理错误('/api/user/update-user', { newName: name, userId: 数据项.id })
      },
    }
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let 当前页码 = 1
    let 每页数量 = 5

    await this.加载数据(当前页码, 每页数量)
  }
}
