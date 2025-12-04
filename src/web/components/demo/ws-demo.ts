import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 主要按钮 } from '../general/base/base-button'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示ws组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-ws-demo', this)
  }

  private 按钮 = new 主要按钮({
    文本: '开始测试',
    点击处理函数: async (): Promise<void> => {
      await API管理器.请求post接口并处理错误('/api/demo/ws/ws-test', {}, async (data) => {
        this.结果.textContent = data.data
      })
    },
  })
  private 结果 = 创建元素('p')

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(this.按钮)
    this.shadow.append(this.结果)
  }
}
