import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 危险按钮 } from '../general/base/base-button'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 用户信息组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-user-profile', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 用户信息 = await API管理器.请求post接口并处理错误('/api/user/get-current-user', {})

    let 容器 = 创建元素('div')
    容器.style.display = 'flex'
    容器.style.flexDirection = 'column'
    容器.style.gap = '10px'

    let 名称显示 = 创建元素('div')
    名称显示.textContent = `用户名: ${用户信息.name}`
    容器.appendChild(名称显示)

    let 管理员显示 = 创建元素('div')
    管理员显示.textContent = `管理员: ${用户信息.is_admin ? '是' : '否'}`
    容器.appendChild(管理员显示)

    let 退出按钮 = new 危险按钮({
      文本: '退出登录',
      点击处理函数: async (): Promise<void> => {
        API管理器.清除token()
        window.location.assign('/login.html')
      },
    })
    容器.appendChild(退出按钮)

    this.shadow.appendChild(容器)
  }
}
