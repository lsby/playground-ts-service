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
  private 最大行数 = 1000
  private 日志容器: HTMLDivElement | null = null
  private 滚动阈值 = 20 // 像素阈值
  private 自动滚动 = true
  private 选中的索引集合 = new Set<number>()
  private 正在选择 = false
  private 选择起始索引: number | null = null
  private 右键菜单: HTMLDivElement | null = null
  private 发生了拖动 = false
  private 上一个选中的索引: number | null = null
  private 正在加载 = false

  protected override async 当加载时(): Promise<void> {
    let 包装器 = 创建元素('div', {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
    })

    let 容器 = 创建元素('div', {
      style: {
        width: '100%',
        height: '100%',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        overflowY: 'auto',
        backgroundColor: 'var(--背景颜色)',
        color: 'var(--文字颜色)',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        boxSizing: 'border-box',
      },
    })

    let 滚动到底部按钮 = 创建元素('button', {
      textContent: '↓',
      style: {
        position: 'absolute',
        bottom: '10px',
        right: '20px',
        width: '32px',
        height: '32px',
        padding: '0',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px var(--深阴影颜色)',
      },
    })

    滚动到底部按钮.addEventListener('click', () => {
      if (this.日志容器 !== null) {
        this.日志容器.scrollTop = this.日志容器.scrollHeight
      }
    })

    let 清空日志按钮 = 创建元素('button', {
      textContent: '🗑️',
      style: {
        position: 'absolute',
        bottom: '10px',
        right: '60px',
        width: '32px',
        height: '32px',
        padding: '0',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px var(--深阴影颜色)',
      },
    })

    清空日志按钮.addEventListener('click', () => {
      this.清空日志()
    })

    // 创建右键菜单
    let 右键菜单 = 创建元素('div', {
      style: {
        position: 'absolute',
        display: 'none',
        backgroundColor: 'var(--卡片背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        boxShadow: '0 2px 8px var(--深阴影颜色)',
        zIndex: '1000',
        padding: '4px 0',
      },
    })

    let 复制按钮 = 创建元素('button', {
      textContent: '复制',
      style: {
        width: '100%',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '14px',
        color: 'var(--文字颜色)',
      },
    })

    复制按钮.addEventListener('click', () => {
      this.复制选中日志()
      this.隐藏右键菜单()
    })

    右键菜单.appendChild(复制按钮)

    this.右键菜单 = 右键菜单
    包装器.appendChild(右键菜单)

    this.日志容器 = 容器
    包装器.appendChild(容器)
    包装器.appendChild(滚动到底部按钮)
    包装器.appendChild(清空日志按钮)
    this.shadow.appendChild(包装器)

    // 监听滚动事件
    容器.addEventListener('scroll', () => {
      if (this.日志容器 !== null) {
        let 滚动到底部距离 = this.日志容器.scrollHeight - this.日志容器.scrollTop - this.日志容器.clientHeight
        this.自动滚动 = 滚动到底部距离 <= this.滚动阈值
      }
    })

    // 监听鼠标事件用于选择
    容器.addEventListener('mousedown', (事件) => {
      if (事件.button === 0) {
        // 左键
        事件.preventDefault() // 阻止默认文本选择
        this.正在选择 = true
        this.发生了拖动 = false
        let 索引 = this.获取日志行索引(事件.target as HTMLElement)
        if (索引 !== null) {
          this.选择起始索引 = 索引
          if (事件.ctrlKey === false && 事件.shiftKey === false) {
            this.选中的索引集合.clear()
            this.选中的索引集合.add(索引)
            this.上一个选中的索引 = 索引
          } else if (事件.ctrlKey === true) {
            // Ctrl+点击：切换选择
            if (this.选中的索引集合.has(索引) === true) {
              this.选中的索引集合.delete(索引)
            } else {
              this.选中的索引集合.add(索引)
            }
            this.上一个选中的索引 = 索引
          } else if (事件.shiftKey === true) {
            // Shift+点击：区域选择，保持上一个选中的索引不变，使用当前点击作为范围的另一端
            let 基准索引 = this.上一个选中的索引
            if (基准索引 !== null) {
              let 开始 = Math.min(基准索引, 索引)
              let 结束 = Math.max(基准索引, 索引)
              this.选中的索引集合.clear()
              for (let i = 开始; i <= 结束; i++) {
                this.选中的索引集合.add(i)
              }
            } else {
              this.选中的索引集合.add(索引)
              this.上一个选中的索引 = 索引
            }
          }
          this.更新选中状态()
        }
      }
    })

    // 添加点击事件监听器,用于清除选择
    容器.addEventListener('click', (事件) => {
      if (事件.button === 0 && this.发生了拖动 === false) {
        // 左键且没有发生拖动
        let 索引 = this.获取日志行索引(事件.target as HTMLElement)
        if (索引 === null) {
          // 点击空白处,清除选择
          this.选中的索引集合.clear()
          this.更新选中状态()
        }
      }
    })

    容器.addEventListener('mousemove', (事件) => {
      if (this.正在选择 === true && this.选择起始索引 !== null) {
        let 当前索引 = this.获取日志行索引(事件.target as HTMLElement)
        if (当前索引 !== null && 当前索引 !== this.选择起始索引) {
          this.发生了拖动 = true
          let 起始索引 = this.选择起始索引
          let 新选中集合 = new Set<number>()

          // 如果按住Ctrl，保留旧的选择
          if (事件.ctrlKey === true) {
            for (let 索引 of this.选中的索引集合) {
              新选中集合.add(索引)
            }
          } else if (事件.shiftKey === true) {
            // Shift拖动：从上一个选中的索引开始作为基准
            let 基准索引 = this.上一个选中的索引
            if (基准索引 !== null) {
              起始索引 = 基准索引
            }
          }

          // 添加从起始到当前的范围
          let 开始 = Math.min(起始索引, 当前索引)
          let 结束 = Math.max(起始索引, 当前索引)
          for (let i = 开始; i <= 结束; i++) {
            新选中集合.add(i)
          }

          this.选中的索引集合 = 新选中集合
          this.更新选中状态()
        }
      }
    })

    容器.addEventListener('mouseup', () => {
      this.正在选择 = false
      this.选择起始索引 = null
    })

    // 监听全局mouseup事件,防止鼠标移出容器后松开
    document.addEventListener('mouseup', () => {
      this.正在选择 = false
      this.选择起始索引 = null
    })

    // 监听右键菜单
    容器.addEventListener('contextmenu', (事件) => {
      事件.preventDefault()
      if (this.选中的索引集合.size > 0 && this.右键菜单 !== null) {
        let 包装器矩形 = 包装器.getBoundingClientRect()
        this.右键菜单.style.left = `${事件.clientX - 包装器矩形.left}px`
        this.右键菜单.style.top = `${事件.clientY - 包装器矩形.top}px`
        this.右键菜单.style.display = 'block'
      }
    })

    // 点击其他地方隐藏菜单
    document.addEventListener('click', (事件) => {
      if (
        this.右键菜单 !== null &&
        事件.target !== this.右键菜单 &&
        this.右键菜单.contains(事件.target as Node) === false
      ) {
        this.隐藏右键菜单()
      }
    })
  }

  public 添加日志(消息: string): void {
    this.日志数组.push(消息)
    if (this.日志数组.length > this.最大行数) {
      this.日志数组.shift()
      // 调整选中的索引:所有索引减1,移除小于0的索引
      let 新选中集合 = new Set<number>()
      for (let 索引 of this.选中的索引集合) {
        let 新索引 = 索引 - 1
        if (新索引 >= 0) {
          新选中集合.add(新索引)
        }
      }
      this.选中的索引集合 = 新选中集合
      // 调整选择起始索引
      if (this.选择起始索引 !== null) {
        this.选择起始索引 = this.选择起始索引 - 1
        if (this.选择起始索引 < 0) {
          this.选择起始索引 = null
        }
      }
      // 调整上一个选中的索引
      if (this.上一个选中的索引 !== null) {
        this.上一个选中的索引 = this.上一个选中的索引 - 1
        if (this.上一个选中的索引 < 0) {
          this.上一个选中的索引 = null
        }
      }
    }
    this.渲染日志()
  }

  public 清空日志(): void {
    this.日志数组 = []
    this.选中的索引集合.clear()
    this.正在选择 = false
    this.选择起始索引 = null
    this.上一个选中的索引 = null
    if (this.日志容器 !== null) {
      this.日志容器.innerHTML = ''
    }
  }

  private 获取日志行索引(元素: HTMLElement): number | null {
    if (this.日志容器 === null) return null

    // 找到最近的日志行元素
    let 日志行元素: HTMLElement | null = 元素
    while (日志行元素 !== null && 日志行元素.parentElement !== this.日志容器) {
      日志行元素 = 日志行元素.parentElement
    }

    if (日志行元素 === null || 日志行元素.parentElement !== this.日志容器) {
      return null
    }

    // 获取元素在容器中的索引
    let 子元素数组 = Array.from(this.日志容器.children)
    let 索引 = 子元素数组.indexOf(日志行元素)
    return 索引 >= 0 ? 索引 : null
  }

  private 更新选中状态(): void {
    if (this.日志容器 === null) return

    for (let i = 0; i < this.日志容器.children.length; i++) {
      let 子元素 = this.日志容器.children[i] as HTMLDivElement
      if (this.选中的索引集合.has(i) === true) {
        子元素.style.backgroundColor = 'var(--选中背景颜色)'
        子元素.style.color = 'var(--文字颜色)'
      } else {
        子元素.style.backgroundColor = ''
        子元素.style.color = ''
      }
    }
  }

  private 渲染日志(): void {
    if (this.日志容器 === null) return

    // 清空容器
    this.日志容器.innerHTML = ''

    if (this.正在加载 === true) {
      // 显示加载指示器
      let 加载指示器 = 创建元素('div', {
        textContent: '正在加载日志...',
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: '16px',
          color: 'var(--文字颜色)',
        },
      })
      this.日志容器.appendChild(加载指示器)
      return
    }

    if (this.日志数组.length === 0) {
      // 显示暂无日志提示
      let 无日志提示 = 创建元素('div', {
        textContent: '暂无日志',
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: '16px',
          color: 'var(--文字颜色)',
        },
      })
      this.日志容器.appendChild(无日志提示)
      return
    }

    // 计算需要移除的行数（当数组被shift时）
    let 需要移除的行数 = this.日志容器.children.length - this.日志数组.length
    if (需要移除的行数 > 0) {
      for (let i = 0; i < 需要移除的行数; i++) {
        let 第一个子元素 = this.日志容器.firstChild
        if (第一个子元素 !== null) {
          this.日志容器.removeChild(第一个子元素)
        }
      }
    }

    // 更新现有行的内容
    for (let i = 0; i < this.日志容器.children.length; i++) {
      let 子元素 = this.日志容器.children[i] as HTMLDivElement
      let 对应日志 = this.日志数组[i]
      if (对应日志 !== void 0 && 子元素.textContent !== 对应日志) {
        子元素.textContent = 对应日志
      }
    }

    // 添加新的日志行
    for (let i = this.日志容器.children.length; i < this.日志数组.length; i++) {
      let 日志 = this.日志数组[i]
      if (日志 !== void 0) {
        let 日志行 = 创建元素('div', {
          textContent: 日志,
          style: {
            marginBottom: '2px',
            wordBreak: 'break-word',
            cursor: 'default',
          },
        })
        this.日志容器.appendChild(日志行)
      }
    }

    // 恢复选中状态
    this.更新选中状态()

    // 如果自动滚动，则滚动到底部
    if (this.自动滚动) {
      this.日志容器.scrollTop = this.日志容器.scrollHeight
    }
  }

  private 复制选中日志(): void {
    let 选中的日志: string[] = []
    let 排序的索引 = Array.from(this.选中的索引集合).sort((a, b) => a - b)
    for (let 索引 of 排序的索引) {
      let 日志 = this.日志数组[索引]
      if (日志 !== void 0) {
        选中的日志.push(日志)
      }
    }
    let 文本 = 选中的日志.join('\n')

    // 优先使用execCommand方法，这在非HTTPS环境下也能工作
    let 文本区域 = document.createElement('textarea')
    文本区域.value = 文本
    文本区域.style.position = 'fixed'
    文本区域.style.left = '-9999px'
    文本区域.style.top = '-9999px'
    document.body.appendChild(文本区域)
    文本区域.focus()
    文本区域.select()

    let 成功 = false
    try {
      成功 = document.execCommand('copy')
    } catch (错误) {
      console.error('execCommand复制失败:', 错误)
    }

    document.body.removeChild(文本区域)

    // 如果execCommand失败且clipboard API可用，尝试使用现代API
    if (成功 === false && typeof navigator.clipboard !== 'undefined') {
      navigator.clipboard.writeText(文本).catch((错误) => {
        console.error('clipboard API复制失败:', 错误)
      })
    }
  }

  private 隐藏右键菜单(): void {
    if (this.右键菜单 !== null) {
      this.右键菜单.style.display = 'none'
    }
  }

  public 设置加载状态(加载: boolean): void {
    this.正在加载 = 加载
    this.渲染日志()
  }
}
