import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/tools/create-element'
import { 横向tab组件 } from '../general/tabs/tabs-horizontal'
import { 检查登录组件 } from '../process/login-check'
import { 设置调试组件 } from '../process/set-debug'
import { 设置网页全屏组件 } from '../process/set-html-full'
import { 设置主题组件 } from '../process/set-theme'
// 业务组件
import { 演示加法组件 } from '../demo/add-demo'
import { 演示capacitor组件 } from '../demo/capacitor-demo'
import { 演示对话框组件 } from '../demo/dialog-demo'
import { 演示electron组件 } from '../demo/electron-demo'
import { FileUploadDemo as 演示文件上传组件 } from '../demo/file-upload-demo'
import { 演示吐司消息组件 } from '../demo/toast-demo'
import { 演示todo组件 } from '../demo/todo-list-demo'
import { 演示用户管理组件 } from '../demo/user-management-demo'
import { 演示ws组件 } from '../demo/ws-demo'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示页面组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-page-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    // 初始化基础组件
    this.shadow.append(new 设置主题组件())
    this.shadow.append(new 设置调试组件({ 排除事件: 'mousemove,mouseenter,mouseleave,scroll' }))
    this.shadow.append(new 设置网页全屏组件())
    this.shadow.append(new 检查登录组件())

    // 布局
    let tabs = new 横向tab组件({ 路由键: 'tab' })

    // Web测试标签页
    let web测试容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      },
    })

    // 第一行: todo测试
    let row1 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
      },
    })
    let todoItem = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
      },
    })
    todoItem.append(创建元素('div', { textContent: 'todo测试' }))
    todoItem.append(new 演示todo组件())
    row1.append(todoItem)
    web测试容器.append(row1)

    // 第二行: 加法, WS
    let row2 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
      },
    })

    // 加法测试
    let addItem = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
      },
    })
    addItem.append(创建元素('div', { textContent: '加法测试' }))
    addItem.append(new 演示加法组件({ a: '1', b: '2' }))
    row2.append(addItem)

    // WS测试
    let wsItem = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
      },
    })
    wsItem.append(创建元素('div', { textContent: 'ws测试' }))
    wsItem.append(new 演示ws组件())
    row2.append(wsItem)

    web测试容器.append(row2)
    tabs.添加标签页({ 标签: 'web测试' }, web测试容器)

    // 表格测试标签页
    let 表格测试容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
        width: '100%',
        height: '100%',
      },
    })
    表格测试容器.append(创建元素('div', { textContent: '表格测试' }))
    表格测试容器.append(new 演示用户管理组件())
    tabs.添加标签页({ 标签: '表格测试' }, 表格测试容器)

    // 提示框测试标签页
    let 提示框测试容器 = 创建元素('div')
    let toastRow = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
      },
    })
    let toastItem = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
      },
    })
    toastItem.append(new 演示吐司消息组件())
    let dialogItem = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flex: '1',
      },
    })
    dialogItem.append(new 演示对话框组件())
    toastRow.append(toastItem, dialogItem)
    提示框测试容器.append(toastRow)
    tabs.添加标签页({ 标签: '提示框测试' }, 提示框测试容器)

    // Capacitor测试
    let capacitor容器 = 创建元素('div')
    capacitor容器.append(new 演示capacitor组件())
    tabs.添加标签页({ 标签: 'capacitor测试' }, capacitor容器)

    // Electron测试
    let electron容器 = 创建元素('div')
    electron容器.append(new 演示electron组件())
    tabs.添加标签页({ 标签: 'electron测试' }, electron容器)

    // 文件上传测试
    let fileUpload容器 = 创建元素('div')
    fileUpload容器.append(new 演示文件上传组件())
    tabs.添加标签页({ 标签: '文件上传测试' }, fileUpload容器)

    this.shadow.append(tabs)
  }
}
