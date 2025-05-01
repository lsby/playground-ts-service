import { 表格组件基类 } from '../../base/table-base'
import { 通过路径获得接口定义 } from '../../global/types'

type 接口定义 = [通过路径获得接口定义<'/api/base/get-list'>]
type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}
type 数据项 = { id: string; value: string }

export class 表格组件 extends 表格组件基类<接口定义, 属性类型, 发出事件类型, 监听事件类型, 数据项> {
  static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-table', this)
  }

  protected override 映射显示字段名称(数据字段: keyof 数据项): string {
    switch (数据字段) {
      case 'id':
        return 'id'
      case 'value':
        return '值'
    }
  }
  protected override async 请求数据(
    当前页码: number,
    每页数量: number,
  ): Promise<{ 数据列表: 数据项[]; 数据总数: number }> {
    let { data: 数据列表, total: 数据总数 } = await this.请求接口并处理错误('/api/base/get-list', {
      page: 当前页码,
      size: 每页数量,
    })
    return { 数据列表, 数据总数 }
  }
  protected override async 添加数据(): Promise<void> {
    let data = prompt('请输入要添加的数据:')
    if (data === '' || data === null) return
    console.log('假装添加数据')
  }
  protected override async 删除数据(数据项: 数据项): Promise<void> {
    if (confirm('你确定要删除这条数据吗？') === false) return
    console.log('假装删除: %o', 数据项)
  }

  protected override async 当加载时(): Promise<void> {
    this.获得宿主样式().width = '100%'

    let 当前页码 = 1
    let 每页数量 = 5

    await this.加载数据(当前页码, 每页数量)
  }
}
