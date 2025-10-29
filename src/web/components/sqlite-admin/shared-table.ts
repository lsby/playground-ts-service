import { GlobalWeb } from '../../global/global'

type 表格选项 = {
  可编辑?: boolean
  表名?: string
  主键列?: string[]
  数据更新回调?: (行索引: number, 列名: string, 新值: string) => Promise<void>
}

export class 共享表格管理器 {
  private API管理器 = GlobalWeb.getItemSync('API管理器')
  private 表格容器: HTMLDivElement
  private 右键菜单: HTMLDivElement
  private 根容器: HTMLElement

  private 选中的行: Set<number> = new Set()
  private 最后点击的单元格: { 行: number; 列: number } | null = null
  private 多选模式: boolean = false
  private 最后点击的行: number = -1
  private 当前数据: Record<string, any>[] = []
  private 当前列名: string[] = []
  private 编辑中: boolean = false
  private 选项: 表格选项 = {}

  public constructor(根容器: HTMLElement, 选项: 表格选项 = {}) {
    this.根容器 = 根容器
    this.选项 = 选项

    this.表格容器 = document.createElement('div')
    this.表格容器.style.flex = '1'
    this.表格容器.style.overflow = 'auto'
    this.表格容器.style.minWidth = '0'

    // 点击表格容器空白处取消选择
    this.表格容器.addEventListener('click', (事件) => {
      let 目标 = 事件.target as Element
      if (目标 === this.表格容器 || 目标.tagName === 'TABLE') {
        this.选中的行.clear()
        this.最后点击的单元格 = null
        this.多选模式 = false
        this.最后点击的行 = -1
        this.重新渲染表格()
      }
    })

    // 右键菜单
    this.右键菜单 = document.createElement('div')
    this.右键菜单.style.position = 'fixed'
    this.右键菜单.style.backgroundColor = 'var(--主要背景颜色)'
    this.右键菜单.style.border = '1px solid var(--边框颜色)'
    this.右键菜单.style.borderRadius = '4px'
    this.右键菜单.style.padding = '4px 0'
    this.右键菜单.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
    this.右键菜单.style.zIndex = '1000'
    this.右键菜单.style.display = 'none'
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
    this.编辑中 = false

    this.当前数据 = 数据
    this.渲染表数据(数据)
  }

  public 更新选项(选项: 表格选项): void {
    this.选项 = { ...this.选项, ...选项 }
  }

  private 渲染表数据(行列表: Record<string, any>[]): void {
    this.表格容器.innerHTML = ''

    if (行列表.length === 0) {
      this.显示消息('无数据')
      return
    }

    let 表 = document.createElement('table')
    表.style.width = '100%'
    表.style.borderCollapse = 'collapse'
    表.style.fontSize = '14px'
    表.style.userSelect = 'none'

    // 表头
    let 表头行 = document.createElement('tr')
    let 第一行 = 行列表[0]
    if (第一行 === void 0) return
    let 列名 = Object.keys(第一行)
    this.当前列名 = 列名
    for (let 列 of 列名) {
      let 表头单元格 = document.createElement('th')
      表头单元格.textContent = 列
      表头单元格.style.border = '1px solid var(--边框颜色)'
      表头单元格.style.padding = '8px'
      表头单元格.style.backgroundColor = 'var(--次要背景颜色)'
      表头单元格.style.textAlign = 'left'
      表头单元格.style.position = 'sticky'
      表头单元格.style.top = '0'
      表头单元格.style.zIndex = '1'
      表头行.appendChild(表头单元格)
    }
    表.appendChild(表头行)

    // 数据行
    for (let 行索引 = 0; 行索引 < 行列表.length; 行索引++) {
      let 行 = 行列表[行索引]
      if (行 === void 0) continue
      let 数据行 = document.createElement('tr')
      let 行选中 = this.选中的行.has(行索引)
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
        let 数据单元格 = document.createElement('td')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let 值 = 行[列]
        数据单元格.textContent = 值 === null ? 'NULL' : String(值)
        数据单元格.style.border = '1px solid var(--边框颜色)'
        数据单元格.style.padding = '8px'
        数据单元格.style.maxWidth = '200px'
        数据单元格.style.overflow = 'hidden'
        数据单元格.style.textOverflow = 'ellipsis'
        数据单元格.style.cursor = 'pointer'

        // 单元格选择样式
        if (
          this.最后点击的单元格 !== null &&
          this.最后点击的单元格.行 === 行索引 &&
          this.最后点击的单元格.列 === 列索引
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

  private 显示消息(消息: string): void {
    this.表格容器.innerHTML = ''
    let 消息元素 = document.createElement('div')
    消息元素.textContent = 消息
    消息元素.style.display = 'flex'
    消息元素.style.justifyContent = 'center'
    消息元素.style.alignItems = 'center'
    消息元素.style.height = '100%'
    消息元素.style.fontSize = '18px'
    消息元素.style.color = 'var(--文本颜色)'
    this.表格容器.appendChild(消息元素)
  }

  private 显示右键菜单(x: number, y: number, 选项列表: { 文本: string; 回调: () => void }[]): void {
    let 菜单 = this.右键菜单
    菜单.innerHTML = ''
    for (let 选项 of 选项列表) {
      let 菜单项 = document.createElement('div')
      菜单项.textContent = 选项.文本
      菜单项.style.padding = '8px 16px'
      菜单项.style.cursor = 'pointer'
      菜单项.style.color = 'var(--文字颜色)'

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
    } else if (shift键 === true) {
      let 开始行 = Math.min(this.最后点击的行, 行索引)
      let 结束行 = Math.max(this.最后点击的行, 行索引)
      this.选中的行.clear()
      for (let i = 开始行; i <= 结束行; i++) {
        this.选中的行.add(i)
      }
    } else {
      this.选中的行.clear()
      this.选中的行.add(行索引)
    }
    this.最后点击的行 = 行索引
    this.多选模式 = this.选中的行.size > 1
    this.重新渲染表格()
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
        回调: () => {
          this.编辑单元格(行索引, 列索引)
        },
      })
    }

    this.显示右键菜单(x, y, 选项列表)
  }

  private 重新渲染表格(): void {
    this.渲染表数据(this.当前数据)
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

    // 创建编辑输入框
    let 输入框 = document.createElement('input')
    输入框.type = 'text'
    输入框.value = 值字符串
    输入框.style.width = '100%'
    输入框.style.padding = '4px'
    输入框.style.border = '1px solid var(--边框颜色)'
    输入框.style.borderRadius = '2px'
    输入框.style.backgroundColor = 'var(--主要背景颜色)'
    输入框.style.color = 'var(--文字颜色)'

    // 找到对应的单元格
    let 表 = this.表格容器.querySelector('table')
    if (表 === null) return
    let 行元素 = 表.rows[行索引 + 1]
    if (行元素 === void 0) return
    let 单元格 = 行元素.cells[列索引]
    if (单元格 === void 0) return

    this.编辑中 = true

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

        let 更新结果 = await this.API管理器.请求post接口('/api/sqlite-admin/execute-query', {
          sql: 更新SQL,
          parameters: 参数列表,
        })
        if (更新结果.status === 'success') {
          // 调用回调
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

        let 删除结果 = await this.API管理器.请求post接口('/api/sqlite-admin/execute-query', {
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

    // 重新渲染
    this.重新渲染表格()
  }
}
