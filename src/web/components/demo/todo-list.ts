import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'
import { LsbyColumn } from '../layout/column'
import { LsbyContainer } from '../layout/container'
import { LsbyRow } from '../layout/row'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 测试todo列表组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-demo-todo-list', this)
  }

  private 输入框 = 创建元素('input')
  private 添加按钮 = 创建元素('button')
  private 列表容器 = 创建元素('ul')
  private todo列表: string[] = []

  private 刷新列表(): void {
    this.列表容器.innerHTML = ''
    this.todo列表.forEach((任务内容, index) => {
      let li = 创建元素('li', {
        textContent: 任务内容,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5em',
          marginBottom: '0.5em',
          border: '1px solid var(--边框颜色)',
          borderRadius: '4px',
        },
      })

      let 删除按钮 = 创建元素('button', {
        textContent: '❌',
        onclick: (): void => {
          this.todo列表.splice(index, 1)
          this.刷新列表()
        },
        style: {
          background: 'transparent',
          border: 'none',
          color: 'red',
          fontSize: '1.2em',
          cursor: 'pointer',
        },
      })

      li.appendChild(删除按钮)
      this.列表容器.appendChild(li)
    })
  }

  protected override async 当加载时(): Promise<void> {
    // ===== 布局容器 =====
    let 主容器 = new LsbyContainer({})
    let 列布局 = new LsbyColumn({})
    let 输入行 = new LsbyRow({})

    列布局.style.justifyContent = 'center'

    // ===== 输入框 =====
    this.输入框.placeholder = '请输入任务内容'
    this.输入框.style.padding = '0.5em'
    this.输入框.style.fontSize = '1em'
    this.输入框.style.border = '1px solid var(--边框颜色)'
    this.输入框.style.borderRadius = '4px'
    this.输入框.style.boxSizing = 'border-box'

    // ===== 按钮 =====
    this.添加按钮.textContent = '添加任务'
    this.添加按钮.style.marginLeft = '0.5em'
    this.添加按钮.style.padding = '0.5em 1em'
    this.添加按钮.style.fontSize = '1em'
    this.添加按钮.style.border = 'none'
    this.添加按钮.style.backgroundColor = 'var(--按钮背景)'
    this.添加按钮.style.color = 'var(--按钮文字)'
    this.添加按钮.style.borderRadius = '4px'
    this.添加按钮.style.cursor = 'pointer'

    // ===== 列表容器样=====
    this.列表容器.style.listStyle = 'none'
    this.列表容器.style.padding = '0'
    this.列表容器.style.marginTop = '1em'
    this.列表容器.style.width = '100%'

    // ===== 事件 =====
    this.添加按钮.onclick = (): void => {
      let 内容 = this.输入框.value.trim()
      if (内容 === '') return
      this.todo列表.push(内容)
      this.输入框.value = ''
      this.刷新列表()
    }

    // ===== 组装 =====
    输入行.append(this.输入框, this.添加按钮)
    列布局.append(输入行, this.列表容器)
    主容器.append(列布局)

    // ===== 挂载 =====
    this.shadow.append(主容器)

    this.刷新列表()
  }
}
