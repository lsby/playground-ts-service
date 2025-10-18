import { 组件基类 } from '../../base/base'
import { 显示对话框, 显示确认对话框 } from '../../global/dialog'

type 属性类型 = Record<string, string>
type 发出事件类型 = Record<string, any>
type 监听事件类型 = Record<string, any>

export class 对话框演示组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-demo-dialog', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 容器 = document.createElement('div')
    容器.style.padding = '20px'
    容器.style.display = 'flex'
    容器.style.flexDirection = 'column'
    容器.style.gap = '10px'
    容器.style.maxWidth = '400px'

    let 标题 = document.createElement('h2')
    标题.textContent = '对话框演示'
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

    let 简单对话框按钮 = 创建按钮('显示简单对话框', async () => {
      await 显示对话框('这是一个简单的对话框消息。')
    })

    let 长文本对话框按钮 = 创建按钮('显示长文本对话框', async () => {
      await 显示对话框(
        '这是一条很长很长的消息，用来测试对话框在处理长文本时的表现是否正常，看看会不会换行或者溢出。这是一条很长很长的消息，用来测试对话框在处理长文本时的表现是否正常，看看会不会换行或者溢出。',
      )
    })

    let 确认对话框按钮 = 创建按钮('显示确认对话框', async () => {
      let 结果 = await 显示确认对话框('您确定要执行此操作吗？')
      if (结果 === true) {
        alert('用户选择了确定')
      } else {
        alert('用户选择了取消')
      }
    })

    let 确认对话框带长文本按钮 = 创建按钮('显示长文本确认对话框', async () => {
      let 结果 = await 显示确认对话框(
        '这是一个很长的确认消息，用来测试确认对话框在处理长文本时的表现是否正常。这是一个很长的确认消息，用来测试确认对话框在处理长文本时的表现是否正常。',
      )
      if (结果 === true) {
        alert('用户选择了确定')
      } else {
        alert('用户选择了取消')
      }
    })

    let 多个对话框按钮 = 创建按钮('连续显示多个对话框', async () => {
      await 显示对话框('第一个对话框')
      let 结果 = await 显示确认对话框('第二个对话框，是否继续？')
      if (结果 === true) {
        await 显示对话框('操作继续')
      } else {
        await 显示对话框('操作取消')
      }
    })

    容器.appendChild(标题)
    容器.appendChild(简单对话框按钮)
    容器.appendChild(长文本对话框按钮)
    容器.appendChild(确认对话框按钮)
    容器.appendChild(确认对话框带长文本按钮)
    容器.appendChild(多个对话框按钮)

    this.shadow.appendChild(容器)
  }
}
