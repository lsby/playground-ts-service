import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 关闭模态框, 显示模态框 } from '../../global/modal'

type 表格选项 = {
  可编辑?: boolean
  表名?: string
  主键列?: string[]
  数据更新回调?: (行索引: number, 列名: string, 新值: string) => Promise<void>
  排序回调?: (排序列: string | null, 排序方向: 'asc' | 'desc' | null) => Promise<void>
}

export class 共享表格管理器 {
  private 表格容器: HTMLDivElement
  private 右键菜单: HTMLDivElement
  private 根容器: HTMLElement

  private 选中的行: Set<number> = new Set()
  private 最后点击的单元格: { 行: number; 列: number } | null = null
  private 多选模式: boolean = false
  private 最后点击的行: number = -1
  private shift选择起点: number = -1
  private 当前数据: Record<string, any>[] = []
  private 当前列名: string[] = []
  private 编辑中: boolean = false
  private 选项: 表格选项 = {}
  private 表格行元素映射: Map<number, HTMLTableRowElement> = new Map()
  private 表格单元格元素映射: Map<string, HTMLTableCellElement> = new Map()
  private 当前排序列: string | null = null
  private 当前排序方向: 'asc' | 'desc' | null = null

  public constructor(根容器: HTMLElement, 选项: 表格选项 = {}) {
    this.根容器 = 根容器
    this.选项 = 选项

    this.表格容器 = 创建元素('div', {
      style: {
        flex: '1',
        overflow: 'auto',
        minWidth: '0',
        minHeight: '0',
      },
    })

    // 点击表格容器空白处取消选择
    this.表格容器.addEventListener('click', (事件) => {
      let 目标 = 事件.target
      if (目标 instanceof Element === false) throw new Error('意外的元素类型')
      if (目标 === this.表格容器 || 目标.tagName === 'TABLE') {
        this.选中的行.clear()
        this.最后点击的单元格 = null
        this.多选模式 = false
        this.最后点击的行 = -1
        this.shift选择起点 = -1
        this.更新选中状态()
      }
    })

    // 右键菜单
    this.右键菜单 = 创建元素('div', {
      style: {
        position: 'fixed',
        backgroundColor: 'var(--主要背景颜色)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        padding: '4px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: '1000',
        display: 'none',
      },
    })
    this.根容器.appendChild(this.右键菜单)
    this.根容器.appendChild(this.表格容器)

    // 点击空白处隐藏右键菜单
    this.根容器.addEventListener('click', () => {
      this.隐藏右键菜单()
    })
  }

  public 更新数据(数据: Record<string, any>[]): void {
    // 隐藏右键菜单
    this.隐藏右键菜单()

    // 清除选择状态
    this.选中的行.clear()
    this.最后点击的单元格 = null
    this.多选模式 = false
    this.最后点击的行 = -1
    this.shift选择起点 = -1
    this.编辑中 = false

    this.当前数据 = 数据
    this.渲染表数据(数据)
  }

  public 更新选项(选项: 表格选项): void {
    this.选项 = { ...this.选项, ...选项 }
  }

  private 显示消息(消息: string): void {
    this.表格容器.innerHTML = ''
    let 消息元素 = 创建元素('div', {
      textContent: 消息,
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '18px',
        color: 'var(--文本颜色)',
      },
    })
    this.表格容器.appendChild(消息元素)
  }

  private 渲染表数据(行列表: Record<string, any>[]): void {
    this.表格容器.innerHTML = ''
    this.表格行元素映射.clear()
    this.表格单元格元素映射.clear()

    if (行列表.length === 0) {
      this.显示消息('无数据')
      return
    }

    let 表 = 创建元素('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
        userSelect: 'none',
      },
    })

    // 表头
    let 表头行 = 创建元素('tr')
    let 第一行 = 行列表[0]
    if (第一行 === void 0) return
    let 列名 = Object.keys(第一行)
    this.当前列名 = 列名
    for (let 列 of 列名) {
      let 表头单元格 = 创建元素('th', {
        style: {
          border: '1px solid var(--边框颜色)',
          padding: '8px',
          backgroundColor: 'var(--次要背景颜色)',
          textAlign: 'left',
          position: 'sticky',
          top: '0',
          zIndex: '1',
          cursor: 'pointer',
          userSelect: 'none',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      })

      // 创建表头内容容器
      let 表头内容容器 = 创建元素('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      })

      // 列名文本
      let 列名文本 = 创建元素('span', {
        textContent: 列,
      })

      // 排序指示器
      let 排序指示器 = 创建元素('span', {
        style: {
          marginLeft: '4px',
          fontSize: '12px',
          color: 'var(--文本颜色)',
        },
      })

      // 设置排序指示器文本
      if (this.当前排序列 === 列) {
        if (this.当前排序方向 === 'asc') {
          排序指示器.textContent = '↑'
        } else if (this.当前排序方向 === 'desc') {
          排序指示器.textContent = '↓'
        }
      }

      表头内容容器.appendChild(列名文本)
      表头内容容器.appendChild(排序指示器)
      表头单元格.appendChild(表头内容容器)

      // 添加点击事件
      表头单元格.addEventListener('click', async (事件) => {
        事件.stopPropagation()
        await this.处理表头点击(列)
      })

      表头行.appendChild(表头单元格)
    }
    表.appendChild(表头行)

    // 数据行
    for (let 行索引 = 0; 行索引 < 行列表.length; 行索引++) {
      let 行 = 行列表[行索引]
      if (行 === void 0) continue
      let 数据行 = 创建元素('tr')
      let 行选中 = this.选中的行.has(行索引)

      // 保存行元素引用
      this.表格行元素映射.set(行索引, 数据行)

      if (行选中 === true) {
        数据行.style.backgroundColor = 'var(--选中背景颜色)'
      }

      // 行点击事件
      数据行.addEventListener('click', (事件) => {
        事件.stopPropagation()
        this.隐藏右键菜单()
        this.处理行点击(行索引, 事件.ctrlKey, 事件.shiftKey)
      })

      for (let 列索引 = 0; 列索引 < 列名.length; 列索引++) {
        let 列 = 列名[列索引]
        if (列 === void 0) continue
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let 值 = 行[列]
        let 数据单元格 = 创建元素('td', {
          textContent: 值 === null ? 'NULL' : String(值),
          style: {
            border: '1px solid var(--边框颜色)',
            padding: '8px',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          },
        })

        // 保存单元格元素引用
        this.表格单元格元素映射.set(`${行索引}-${列索引}`, 数据单元格)

        // 单元格选择样式
        if (
          this.最后点击的单元格 !== null &&
          this.最后点击的单元格.行 === 行索引 &&
          this.最后点击的单元格.列 === 列索引 &&
          this.多选模式 === false
        ) {
          数据单元格.style.backgroundColor = 'var(--强调背景颜色)'
          数据单元格.style.border = '2px solid var(--强调颜色)'
        }

        // 单元格点击事件
        数据单元格.addEventListener('click', (事件) => {
          事件.stopPropagation()
          this.隐藏右键菜单()
          this.处理单元格点击(行索引, 列索引, 事件.ctrlKey, 事件.shiftKey)
        })

        // 单元格双击事件
        数据单元格.addEventListener('dblclick', (事件) => {
          事件.stopPropagation()
          if (this.编辑中 === false && this.选项.可编辑 === true) {
            this.编辑单元格(行索引, 列索引)
          }
        })

        // 右键菜单事件
        数据单元格.addEventListener('contextmenu', (事件) => {
          事件.preventDefault()
          事件.stopPropagation()
          if (
            this.选中的行.size === 0 ||
            this.选中的行.has(行索引) === false ||
            (this.选中的行.size === 1 &&
              (this.最后点击的单元格 === null ||
                this.最后点击的单元格.行 !== 行索引 ||
                this.最后点击的单元格.列 !== 列索引))
          ) {
            this.处理单元格点击(行索引, 列索引, false, false)
          }
          this.处理右键菜单(行索引, 列索引, 事件.clientX, 事件.clientY)
        })

        数据行.appendChild(数据单元格)
      }
      表.appendChild(数据行)
    }

    this.表格容器.appendChild(表)
  }

  private async 处理表头点击(列名: string): Promise<void> {
    // 确定新的排序方向
    let 新排序方向: 'asc' | 'desc' | null = null
    if (this.当前排序列 !== 列名) {
      // 点击不同列，开始升序排序
      新排序方向 = 'asc'
    } else {
      // 点击同一列，循环：asc -> desc -> null
      if (this.当前排序方向 === 'asc') {
        新排序方向 = 'desc'
      } else if (this.当前排序方向 === 'desc') {
        新排序方向 = null
      } else {
        新排序方向 = 'asc'
      }
    }

    // 更新排序状态
    this.当前排序列 = 新排序方向 !== null ? 列名 : null
    this.当前排序方向 = 新排序方向

    // 调用排序回调
    if (this.选项.排序回调 !== void 0) {
      await this.选项.排序回调(this.当前排序列, this.当前排序方向)
    }
  }

  private 显示右键菜单(x: number, y: number, 选项列表: { 文本: string; 回调: () => void }[]): void {
    let 菜单 = this.右键菜单
    菜单.innerHTML = ''
    for (let 选项 of 选项列表) {
      let 菜单项 = 创建元素('div', {
        textContent: 选项.文本,
        style: {
          padding: '8px 16px',
          cursor: 'pointer',
          color: 'var(--文字颜色)',
        },
      })

      菜单项.addEventListener('mouseenter', () => {
        菜单项.style.backgroundColor = 'var(--次要背景颜色)'
      })
      菜单项.addEventListener('mouseleave', () => {
        菜单项.style.backgroundColor = 'transparent'
      })
      菜单项.addEventListener('click', () => {
        选项.回调()
        this.隐藏右键菜单()
      })
      菜单.appendChild(菜单项)
    }
    菜单.style.left = `${x}px`
    菜单.style.top = `${y}px`
    菜单.style.display = 'block'
  }

  private 隐藏右键菜单(): void {
    this.右键菜单.style.display = 'none'
  }

  private 处理行点击(行索引: number, ctrl键: boolean, shift键: boolean): void {
    if (this.编辑中 === true) return
    if (ctrl键 === true) {
      if (this.选中的行.has(行索引) === true) {
        this.选中的行.delete(行索引)
      } else {
        this.选中的行.add(行索引)
      }
      // Ctrl 选择时重置 Shift 选择起点
      this.shift选择起点 = -1
    } else if (shift键 === true) {
      // 如果还没有 Shift 选择起点，设置为最后点击的行
      if (this.shift选择起点 === -1) {
        this.shift选择起点 = this.最后点击的行
      }
      let 开始行 = Math.min(this.shift选择起点, 行索引)
      let 结束行 = Math.max(this.shift选择起点, 行索引)
      this.选中的行.clear()
      for (let i = 开始行; i <= 结束行; i++) {
        this.选中的行.add(i)
      }
    } else {
      this.选中的行.clear()
      this.选中的行.add(行索引)
      // 普通点击时重置 Shift 选择起点
      this.shift选择起点 = -1
    }
    this.最后点击的行 = 行索引
    this.多选模式 = this.选中的行.size > 1
    this.更新选中状态()
  }

  private 处理单元格点击(行索引: number, 列索引: number, ctrl键: boolean, shift键: boolean): void {
    if (this.编辑中 === true) return
    this.最后点击的单元格 = { 行: 行索引, 列: 列索引 }
    this.处理行点击(行索引, ctrl键, shift键)
  }

  private 处理右键菜单(行索引: number, 列索引: number, x: number, y: number): void {
    let 选项列表: { 文本: string; 回调: () => void }[] = []

    // 复制选项
    选项列表.push({
      文本: '复制',
      回调: () => {
        this.复制选中内容()
      },
    })

    // 删除选项
    if (this.选中的行.size > 0) {
      选项列表.push({
        文本: '删除',
        回调: () => {
          void this.删除选中行()
        },
      })
    }

    // 如果可编辑且是单选行，添加编辑选项
    if (
      this.选项.可编辑 === true &&
      this.选中的行.size === 1 &&
      this.最后点击的单元格 !== null &&
      this.最后点击的单元格.行 === 行索引 &&
      this.最后点击的单元格.列 === 列索引
    ) {
      选项列表.push({
        文本: '编辑',
        回调: async () => {
          await this.显示编辑模态框(行索引, 列索引)
        },
      })
    }

    this.显示右键菜单(x, y, 选项列表)
  }

  private 重新渲染表格(): void {
    this.渲染表数据(this.当前数据)
  }

  private 更新选中状态(): void {
    // 使用 requestAnimationFrame 来确保在浏览器下一次重绘前更新,避免滚动条跳动
    requestAnimationFrame(() => {
      // 保存当前滚动位置
      let 滚动位置 = this.表格容器.scrollTop

      // 高效更新选中状态,不重新渲染整个表格
      for (let [行索引, 行元素] of this.表格行元素映射) {
        if (this.选中的行.has(行索引) === true) {
          行元素.style.backgroundColor = 'var(--选中背景颜色)'
        } else {
          行元素.style.backgroundColor = ''
        }
      }

      // 更新单元格选中状态
      for (let [键, 单元格元素] of this.表格单元格元素映射) {
        let [行索引字符串, 列索引字符串] = 键.split('-')
        let 行索引 = parseInt(行索引字符串 !== void 0 ? 行索引字符串 : '')
        let 列索引 = parseInt(列索引字符串 !== void 0 ? 列索引字符串 : '')

        if (
          this.最后点击的单元格 !== null &&
          this.最后点击的单元格.行 === 行索引 &&
          this.最后点击的单元格.列 === 列索引 &&
          this.多选模式 === false
        ) {
          单元格元素.style.backgroundColor = 'var(--强调背景颜色)'
          单元格元素.style.border = '2px solid var(--强调颜色)'
        } else {
          单元格元素.style.backgroundColor = ''
          单元格元素.style.border = '1px solid var(--边框颜色)'
        }
      }

      // 恢复滚动位置
      this.表格容器.scrollTop = 滚动位置
    })
  }

  private 复制选中内容(): void {
    let 内容 = ''
    if (this.选中的行.size === 1 && this.最后点击的单元格 !== null) {
      // 复制单个单元格
      let 行 = this.当前数据[this.最后点击的单元格.行]
      if (行 !== void 0) {
        let 列名 = this.当前列名[this.最后点击的单元格.列]
        if (列名 !== void 0) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let 值 = 行[列名]
          内容 = 值 === null ? 'NULL' : String(值)
        }
      }
    } else if (this.选中的行.size > 0) {
      // 复制选中行
      let 行内容列表: string[] = []
      for (let 行索引 = 0; 行索引 < this.当前数据.length; 行索引++) {
        if (this.选中的行.has(行索引) === true) {
          let 行 = this.当前数据[行索引]
          if (行 !== void 0) {
            let 单元格内容列表: string[] = []
            for (let 列名 of this.当前列名) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              let 值 = 行[列名]
              单元格内容列表.push(值 === null ? 'NULL' : String(值))
            }
            行内容列表.push(单元格内容列表.join(','))
          }
        }
      }
      内容 = 行内容列表.join('\n') + '\n'
    }
    if (内容 !== '') {
      navigator.clipboard.writeText(内容).catch((错误) => {
        console.error('复制失败:', 错误)
      })
    }
  }

  private 编辑单元格(行索引: number, 列索引: number): void {
    let 行 = this.当前数据[行索引]
    if (行 === void 0) return
    let 列名 = this.当前列名[列索引]
    if (列名 === void 0) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let 当前值 = 行[列名]
    let 值字符串 = 当前值 === null ? '' : String(当前值)

    let 单元格键 = `${行索引}-${列索引}`
    let 单元格 = this.表格单元格元素映射.get(单元格键)
    if (单元格 === void 0) return

    this.编辑中 = true

    // 创建编辑输入框
    let 输入框 = 创建元素('input', {
      type: 'text',
      value: 值字符串,
      style: {
        width: '100%',
        padding: '4px',
        border: '1px solid var(--边框颜色)',
        borderRadius: '2px',
        backgroundColor: 'var(--主要背景颜色)',
        color: 'var(--文字颜色)',
        boxSizing: 'border-box',
      },
    })

    // 替换单元格内容
    单元格.innerHTML = ''
    单元格.appendChild(输入框)
    输入框.focus()
    输入框.select()

    输入框.addEventListener('click', (事件) => {
      事件.stopPropagation()
    })

    let 保存值 = async (): Promise<void> => {
      let 新值 = 输入框.value

      if (this.选项.表名 === void 0) {
        单元格.textContent = 值字符串 === '' ? 'NULL' : 值字符串
        this.编辑中 = false
        return
      }

      try {
        let 参数列表: (string | number | boolean | null)[] = []

        if (新值 === '') {
          参数列表.push(null)
        } else {
          参数列表.push(新值)
        }

        let 条件部分列表: string[] = []

        if (this.选项.主键列 !== void 0) {
          for (let 主键列 of this.选项.主键列) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let 主键值 = 行[主键列]
            条件部分列表.push('`' + 主键列 + '` = ?')
            参数列表.push(主键值 === null ? null : 主键值)
          }
        }

        if (条件部分列表.length === 0) {
          console.error('无法更新：找不到主键')
          单元格.textContent = 值字符串 === '' ? 'NULL' : 值字符串
          this.编辑中 = false
          return
        }

        let 条件部分 = 条件部分列表.join(' AND ')
        let 更新SQL = 'UPDATE `' + this.选项.表名 + '` SET `' + 列名 + '` = ? WHERE ' + 条件部分

        let 更新结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
          sql: 更新SQL,
          parameters: 参数列表,
        })
        if (更新结果.status === 'success') {
          // 更新本地数据,避免重新渲染
          行[列名] = 新值 === '' ? null : 新值
          单元格.textContent = 新值 === '' ? 'NULL' : 新值

          // 调用回调(如果需要刷新其他数据)
          if (this.选项.数据更新回调 !== void 0) {
            await this.选项.数据更新回调(行索引, 列名, 新值)
          }
        } else {
          console.error('更新失败:', 更新结果)
          单元格.textContent = 值字符串 === '' ? 'NULL' : 值字符串
        }
      } catch (错误) {
        console.error('更新失败:', 错误)
        单元格.textContent = 值字符串 === '' ? 'NULL' : 值字符串
      } finally {
        this.编辑中 = false
      }
    }

    let 取消编辑 = (): void => {
      单元格.textContent = 值字符串 === '' ? 'NULL' : 值字符串
      this.编辑中 = false
    }

    输入框.addEventListener('keydown', async (事件) => {
      if (事件.key === 'Enter') {
        await 保存值()
      } else if (事件.key === 'Escape') {
        取消编辑()
      }
    })

    输入框.addEventListener('blur', async () => {
      await 保存值()
    })
  }

  private async 显示编辑模态框(行索引: number, 列索引: number): Promise<void> {
    let 行 = this.当前数据[行索引]
    if (行 === void 0) return
    let 列名 = this.当前列名[列索引]
    if (列名 === void 0) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let 当前值 = 行[列名]
    let 值字符串 = 当前值 === null ? '' : String(当前值)

    // 创建模态框内容
    let 内容容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minWidth: '400px',
        minHeight: '200px',
      },
    })

    // 多行输入框
    let 输入框 = 创建元素('textarea', {
      value: 值字符串,
      style: {
        width: '100%',
        height: '150px',
        padding: '8px',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        backgroundColor: 'var(--主要背景颜色)',
        color: 'var(--文字颜色)',
        fontFamily: 'monospace',
        fontSize: '14px',
        resize: 'vertical',
        boxSizing: 'border-box',
      },
    })

    内容容器.appendChild(输入框)

    // 按钮容器
    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
      },
    })

    // 确定按钮
    let 确定按钮 = 创建元素('button', {
      textContent: '确定',
      style: {
        padding: '8px 16px',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    })

    // 取消按钮
    let 取消按钮 = 创建元素('button', {
      textContent: '取消',
      style: {
        padding: '8px 16px',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    })

    按钮容器.appendChild(取消按钮)
    按钮容器.appendChild(确定按钮)
    内容容器.appendChild(按钮容器)

    // 保存函数
    let 保存值 = async (): Promise<void> => {
      let 新值 = 输入框.value

      if (this.选项.表名 === void 0) {
        await 关闭模态框()
        return
      }

      try {
        let 参数列表: (string | number | boolean | null)[] = []

        if (新值 === '') {
          参数列表.push(null)
        } else {
          参数列表.push(新值)
        }

        let 条件部分列表: string[] = []

        if (this.选项.主键列 !== void 0) {
          for (let 主键列 of this.选项.主键列) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let 主键值 = 行[主键列]
            条件部分列表.push('`' + 主键列 + '` = ?')
            参数列表.push(主键值 === null ? null : 主键值)
          }
        }

        if (条件部分列表.length === 0) {
          console.error('无法更新：找不到主键')
          await 关闭模态框()
          return
        }

        let 条件部分 = 条件部分列表.join(' AND ')
        let 更新SQL = 'UPDATE `' + this.选项.表名 + '` SET `' + 列名 + '` = ? WHERE ' + 条件部分

        let 更新结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
          sql: 更新SQL,
          parameters: 参数列表,
        })
        if (更新结果.status === 'success') {
          // 更新本地数据
          行[列名] = 新值 === '' ? null : 新值

          // 更新单元格显示
          let 单元格键 = `${行索引}-${列索引}`
          let 单元格 = this.表格单元格元素映射.get(单元格键)
          if (单元格 !== void 0) {
            单元格.textContent = 新值 === '' ? 'NULL' : 新值
          }

          // 调用回调(如果需要刷新其他数据)
          if (this.选项.数据更新回调 !== void 0) {
            await this.选项.数据更新回调(行索引, 列名, 新值)
          }

          await 关闭模态框()
        } else {
          console.error('更新失败:', 更新结果)
          alert('更新失败，请查看控制台以获取详细信息')
        }
      } catch (错误) {
        console.error('更新失败:', 错误)
        alert('更新失败，请查看控制台以获取详细信息')
      }
    }

    // 绑定事件
    确定按钮.addEventListener('click', () => {
      void 保存值()
    })

    取消按钮.addEventListener('click', () => {
      void 关闭模态框()
    })

    输入框.addEventListener('keydown', (事件) => {
      if (事件.key === 'Enter' && 事件.ctrlKey === true) {
        事件.preventDefault()
        void 保存值()
      } else if (事件.key === 'Escape') {
        void 关闭模态框()
      }
    })

    // 聚焦输入框
    setTimeout(() => {
      输入框.focus()
      输入框.select()
    }, 100)

    // 显示模态框
    await 显示模态框(
      {
        标题: `编辑 ${列名}`,
        可关闭: true,
      },
      内容容器,
    )
  }

  private async 删除选中行(): Promise<void> {
    if (window.confirm('确定要删除选中的行吗？') === false) {
      return
    }

    if (this.选项.表名 === void 0 || this.选项.主键列 === void 0) {
      alert('无法删除：缺少表名或主键列')
      return
    }

    let 删除的行索引列表 = Array.from(this.选中的行).sort((a, b) => b - a) // 从大到小排序，避免索引变化
    let 错误列表: string[] = []

    for (let 行索引 of 删除的行索引列表) {
      let 行 = this.当前数据[行索引]
      if (行 === void 0) continue

      try {
        let 参数列表: (string | number | boolean | null)[] = []
        let 条件部分列表: string[] = []

        for (let 主键列 of this.选项.主键列) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let 主键值 = 行[主键列]
          条件部分列表.push('`' + 主键列 + '` = ?')
          参数列表.push(主键值 === null ? null : 主键值)
        }

        if (条件部分列表.length === 0) {
          let 错误信息 = `行 ${行索引}：找不到主键`
          console.error(错误信息)
          错误列表.push(错误信息)
          continue
        }

        let 条件部分 = 条件部分列表.join(' AND ')
        let 删除SQL = 'DELETE FROM `' + this.选项.表名 + '` WHERE ' + 条件部分

        let 删除结果 = await API管理器.请求post接口('/api/sqlite-admin/execute-query', {
          sql: 删除SQL,
          parameters: 参数列表,
        })

        if (删除结果.status === 'success') {
          // 从数据中移除
          this.当前数据.splice(行索引, 1)
        } else {
          let 错误信息 = `行 ${行索引}：${JSON.stringify(删除结果)}`
          console.error('删除失败:', 删除结果)
          错误列表.push(错误信息)
        }
      } catch (错误) {
        let 错误信息 = `行 ${行索引}：${String(错误)}`
        console.error('删除失败:', 错误)
        错误列表.push(错误信息)
      }
    }

    if (错误列表.length > 0) {
      alert(`删除完成，但有以下错误：\n${错误列表.join('\n')}`)
    }

    // 清除选择状态
    this.选中的行.clear()
    this.最后点击的单元格 = null
    this.多选模式 = false
    this.最后点击的行 = -1
    this.shift选择起点 = -1

    // 重新渲染
    this.重新渲染表格()
  }
}
