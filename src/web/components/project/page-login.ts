import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/tools/create-element'
import { 设置调试组件 } from '../process/set-debug'
import { 设置网页全屏组件 } from '../process/set-html-full'
import { 设置主题组件 } from '../process/set-theme'
import { 登录组件 } from './login'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 登录页面组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-page-login', this)
  }

  protected override async 当加载时(): Promise<void> {
    this.shadow.append(new 设置主题组件({ 从数据库加载: false }))
    this.shadow.append(new 设置调试组件({ 排除事件: 'mousemove,mouseenter,mouseleave,scroll' }))
    this.shadow.append(new 设置网页全屏组件())

    let 居中容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      },
    })
    居中容器.append(new 登录组件())
    this.shadow.append(居中容器)
  }
}
