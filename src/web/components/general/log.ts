import { 组件基类 } from '../../base/base'
import { 创建元素 } from '../../global/create-element'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyLog extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-log', this)
  }

  private 日志数组: string[] = []
  private 最大行数 = 100
  private 日志容器: HTMLDivElement | null = null
  private 滚动阈值 = 20 // 像素阈值
  private 自动滚动 = true

  protected override async 当加载时(): Promise<void> {
    let 容器 = 创建元素('div', {
      style: {
        width: '100%',
        height: '100%',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        boxSizing: 'border-box',
      },
    })

    this.日志容器 = 容器
    this.shadow.appendChild(容器)

    // 监听滚动事件
    容器.addEventListener('scroll', () => {
      if (this.日志容器 !== null) {
        let 滚动到底部距离 = this.日志容器.scrollHeight - this.日志容器.scrollTop - this.日志容器.clientHeight
        this.自动滚动 = 滚动到底部距离 <= this.滚动阈值
      }
    })
  }

  public 添加日志(消息: string): void {
    this.日志数组.push(消息)
    if (this.日志数组.length > this.最大行数) {
      this.日志数组.shift()
    }
    this.渲染日志()
  }

  public 清空日志(): void {
    this.日志数组 = []
    if (this.日志容器 !== null) {
      this.日志容器.innerHTML = ''
    }
  }

  private 渲染日志(): void {
    if (this.日志容器 === null) return

    // 如果容器为空，初始化所有日志
    if (this.日志容器.children.length === 0) {
      for (let 日志 of this.日志数组) {
        let 日志行 = 创建元素('div', {
          textContent: 日志,
          style: {
            marginBottom: '2px',
          },
        })
        this.日志容器.appendChild(日志行)
      }
    } else {
      // 只添加新的日志行
      for (let i = this.日志容器.children.length; i < this.日志数组.length; i++) {
        let 日志 = this.日志数组[i]
        if (日志 !== void 0) {
          let 日志行 = 创建元素('div', {
            textContent: 日志,
            style: {
              marginBottom: '2px',
            },
          })
          this.日志容器.appendChild(日志行)
        }
      }

      // 如果超过了最大行数，移除最旧的行
      while (this.日志容器.children.length > this.最大行数) {
        let 第一个子元素 = this.日志容器.firstChild
        if (第一个子元素 !== null) {
          this.日志容器.removeChild(第一个子元素)
        }
      }
    }

    // 如果自动滚动，则滚动到底部
    if (this.自动滚动) {
      this.日志容器.scrollTop = this.日志容器.scrollHeight
    }
  }
}
