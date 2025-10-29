import { 组件基类 } from '../../base/base'
import { 信息提示, 成功提示, 警告提示, 错误提示 } from '../../global/toast'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 吐司演示组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-toast', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 容器 = document.createElement('div')
    容器.style.padding = '20px'
    容器.style.display = 'flex'
    容器.style.flexDirection = 'column'
    容器.style.gap = '10px'
    容器.style.maxWidth = '400px'

    let 标题 = document.createElement('h2')
    标题.textContent = '吐司消息演示'
    标题.style.marginBottom = '10px'

    let 创建按钮 = (文字: string, 点击回调: () => Promise<void>): HTMLButtonElement => {
      let 按钮 = document.createElement('button')
      按钮.textContent = 文字
      按钮.style.padding = '10px 20px'
      按钮.style.border = '1px solid var(--边框颜色)'
      按钮.style.borderRadius = '4px'
      按钮.style.backgroundColor = 'var(--按钮背景)'
      按钮.style.color = 'var(--按钮文字)'
      按钮.style.cursor = 'pointer'
      按钮.style.fontSize = '14px'
      按钮.style.transition = 'all 0.3s'

      按钮.addEventListener('mouseenter', () => {
        按钮.style.backgroundColor = 'var(--悬浮背景颜色)'
      })
      按钮.addEventListener('mouseleave', () => {
        按钮.style.backgroundColor = 'var(--按钮背景)'
      })

      按钮.addEventListener('click', async () => {
        await 点击回调()
      })

      return 按钮
    }

    let 成功按钮 = 创建按钮('显示成功消息', async () => {
      await 成功提示('操作成功完成!')
    })

    let 错误按钮 = 创建按钮('显示错误消息', async () => {
      await 错误提示('发生了一个错误!')
    })

    let 警告按钮 = 创建按钮('显示警告消息', async () => {
      await 警告提示('这是一个警告提示!')
    })

    let 信息按钮 = 创建按钮('显示信息消息', async () => {
      await 信息提示('这是一条普通信息')
    })

    let 长文本按钮 = 创建按钮('显示长文本消息', async () => {
      await 信息提示('这是一条很长很长的消息,用来测试吐司组件在处理长文本时的表现是否正常,看看会不会换行或者溢出。')
    })

    let 自定义时长按钮 = 创建按钮('显示自定义时长消息(5秒)', async () => {
      await 成功提示('这条消息会显示5秒钟', 5000)
    })

    let 多个吐司按钮 = 创建按钮('连续显示多个吐司', async () => {
      await 成功提示('第一条消息')
      await 警告提示('第二条消息')
      await 错误提示('第三条消息')
      await 信息提示('第四条消息')
    })

    容器.appendChild(标题)
    容器.appendChild(成功按钮)
    容器.appendChild(错误按钮)
    容器.appendChild(警告按钮)
    容器.appendChild(信息按钮)
    容器.appendChild(长文本按钮)
    容器.appendChild(自定义时长按钮)
    容器.appendChild(多个吐司按钮)

    this.shadow.appendChild(容器)
  }
}
