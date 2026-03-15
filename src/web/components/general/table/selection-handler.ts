import { 数据表列配置 } from './types'

export type 选择处理器上下文<数据项> = {
  数据列表: 数据项[]
  列配置: 数据表列配置<数据项>[]
  表格行元素映射: Map<number, HTMLTableRowElement>
  表格单元格元素映射: Map<string, HTMLTableCellElement>
  通知更新: () => void
}

export class 表格选择管理器<数据项> {
  private 选中的行: Set<number> = new Set()
  private 最后点击的单元格: { 行: number; 列: number } | null = null
  private 多选模式: boolean = false
  private 最后点击的行: number = -1
  private shift选择起点: number = -1

  public constructor(private 上下文: 选择处理器上下文<数据项>) {}

  public 获得选中的行(): Set<number> {
    return this.选中的行
  }
  public 获得最后点击的单元格(): { 行: number; 列: number } | null {
    return this.最后点击的单元格
  }
  public 获得是否为多选模式(): boolean {
    return this.多选模式
  }
  public 获得最后点击的行(): number {
    return this.最后点击的行
  }
  public 获得Shift选择起点(): number {
    return this.shift选择起点
  }

  public 清除选择(): void {
    this.选中的行.clear()
    this.最后点击的单元格 = null
    this.多选模式 = false
    this.最后点击的行 = -1
    this.shift选择起点 = -1
  }

  public 处理行点击(行索引: number, ctrl键: boolean, shift键: boolean): void {
    if (ctrl键 === true) {
      if (this.选中的行.has(行索引) === true) {
        this.选中的行.delete(行索引)
      } else {
        this.选中的行.add(行索引)
      }
      this.shift选择起点 = -1
    } else if (shift键 === true) {
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
      this.shift选择起点 = -1
    }
    this.最后点击的行 = 行索引
    this.多选模式 = this.选中的行.size > 1
  }

  public 处理单元格点击(行索引: number, 列索引: number, ctrl键: boolean, shift键: boolean): void {
    this.最后点击的单元格 = { 行: 行索引, 列: 列索引 }
    this.处理行点击(行索引, ctrl键, shift键)
  }

  public async 复制选中内容(): Promise<void> {
    let 内容 = ''
    if (this.选中的行.size === 1 && this.最后点击的单元格 !== null) {
      let 行数据 = this.上下文.数据列表[this.最后点击的单元格.行]
      if (行数据 !== void 0 && 行数据 !== null) {
        let 列配置 = this.上下文.列配置[this.最后点击的单元格.列]
        if (列配置 !== void 0) {
          let 值 = 行数据[列配置.字段名]
          内容 = 值 === null || 值 === void 0 ? 'NULL' : String(值)
        }
      }
    } else if (this.选中的行.size > 0) {
      let 行内容列表: string[] = []
      for (let 行索引 = 0; 行索引 < this.上下文.数据列表.length; 行索引++) {
        if (this.选中的行.has(行索引) === true) {
          let 行数据 = this.上下文.数据列表[行索引]
          if (行数据 !== void 0 && 行数据 !== null) {
            let 单元格内容列表: string[] = []
            for (let 列 of this.上下文.列配置) {
              let 值 = 行数据[列.字段名]
              单元格内容列表.push(值 === null || 值 === void 0 ? 'NULL' : String(值))
            }
            行内容列表.push(单元格内容列表.join('\t'))
          }
        }
      }

      内容 = 行内容列表.join('\n') + '\n'
    }
    if (内容 !== '') {
      try {
        await navigator.clipboard.writeText(内容)
      } catch (错误) {
        console.error('复制失败:', 错误)
      }
    }
  }

  public 更新选中状态(): void {
    requestAnimationFrame(() => {
      for (let [行索引, 行元素] of this.上下文.表格行元素映射) {
        行元素.style.backgroundColor = this.选中的行.has(行索引) === true ? 'var(--选中背景颜色)' : ''
      }
      for (let [键, 单元格元素] of this.上下文.表格单元格元素映射) {
        let 部分列表 = 键.split('-')
        let 行索引 = parseInt(部分列表[0] ?? '-1')
        let 列索引 = parseInt(部分列表[1] ?? '-1')
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
    })
  }
}
