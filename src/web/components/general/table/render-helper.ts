import { 显示输入对话框 } from '../../../global/manager/dialog-manager'
import { 创建元素 } from '../../../global/tools/create-element'
import { 普通按钮 } from '../base/base-button'
import { 数据表列配置, 数据表操作配置, 顶部操作配置 } from './types'

export type 表格渲染上下文<数据项> = {
  列配置: 数据表列配置<数据项>[]
  数据列表: 数据项[]
  操作列表: 数据表操作配置<数据项>[]
  顶部操作列表: 顶部操作配置[]
  筛选条件: Record<string, string>
  排序列表: { field: keyof 数据项; direction: 'asc' | 'desc' }[]
  选中的行: Set<number>
  最后点击的单元格: { 行: number; 列: number } | null
  多选模式: boolean
  列最小宽度: string
  列最大宽度: string | undefined
  表格行元素映射: Map<number, HTMLTableRowElement>
  表格单元格元素映射: Map<string, HTMLTableCellElement>
  表头元素映射: Map<number, HTMLElement>
  列单元格映射: Map<number, HTMLElement[]>
  是否正在拖动: boolean
  加载数据: () => Promise<void>
  刷新数据: () => Promise<void>
  处理鼠标移动: (event: MouseEvent) => void
  处理鼠标释放: () => void
  处理行点击: (行索引: number, ctrl键: boolean, shift键: boolean) => void
  处理单元格点击: (行索引: number, 列索引: number, ctrl键: boolean, shift键: boolean) => void
  更新选中状态: () => void
  显示右键菜单: (x: number, y: number) => void
  设置状态: (
    状态: Partial<{ 拖动列索引: number; 拖动起始X: number; 拖动起始宽度: number; 是否正在拖动: boolean }>,
  ) => void
}

export function 渲染顶部操作区<数据项>(上下文: 表格渲染上下文<数据项>): HTMLElement | null {
  if (上下文.顶部操作列表.length === 0) return null
  let 操作区 = 创建元素('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } })
  for (let 操作 of 上下文.顶部操作列表) {
    let 按钮 = new 普通按钮({ 文本: 操作.名称, 点击处理函数: 操作.回调 })
    操作区.appendChild(按钮)
  }
  return 操作区
}

export async function 渲染表头<数据项>(
  上下文: 表格渲染上下文<数据项>,
  操作列宽度列表: number[],
): Promise<HTMLTableSectionElement> {
  let 表头 = 创建元素('thead')
  let 表头行 = 创建元素('tr')
  for (let 列 of 上下文.列配置) {
    let 字段名 = String(列.字段名)
    let 列索引 = 上下文.列配置.indexOf(列)
    let 有筛选值 = 上下文.筛选条件[字段名] !== void 0
    let 筛选值 = 上下文.筛选条件[字段名] ?? ''
    let 列最大宽度 = 列.列最大宽度 ?? 上下文.列最大宽度
    let th = 创建元素('th', {
      style: {
        border: '1px solid var(--边框颜色)',
        padding: '8px',
        textAlign: 'left',
        backgroundColor: 有筛选值 ? 'var(--color-accent)' : 'var(--color-background-secondary)',
        position: 'relative',
        userSelect: 'none',
        minWidth: 列.列最小宽度 ?? 上下文.列最小宽度,
        ...(列最大宽度 !== void 0 ? { maxWidth: 列最大宽度, width: 列最大宽度 } : {}),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    })
    th.setAttribute('data-col-index', 列索引.toString())
    上下文.表头元素映射.set(列索引, th)
    let 表头内容 = 创建元素('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
    })
    let 标签文本 = 创建元素('span', { textContent: 列.显示名 })
    表头内容.appendChild(标签文本)
    if (有筛选值) {
      let 筛选值容器 = 创建元素('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } })
      let 筛选值显示 = 创建元素('span', {
        textContent: `筛选: ${筛选值}`,
        style: { fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 'bold' },
      })
      筛选值容器.appendChild(筛选值显示)
      let 清空按钮 = new 普通按钮({
        文本: '✕',
        元素样式: { fontSize: '12px', color: 'var(--color-text-secondary)' },
        点击处理函数: async (event: Event): Promise<void> => {
          event.stopPropagation()
          delete 上下文.筛选条件[字段名]
          await 上下文.加载数据()
        },
      })
      筛选值容器.appendChild(清空按钮)
      表头内容.appendChild(筛选值容器)
    }
    if (列.可筛选 === true) {
      let 筛选图标 = new 普通按钮({
        文本: '🔍',
        点击处理函数: async (event: Event): Promise<void> => {
          event.stopPropagation()
          let 当前筛选值 = 上下文.筛选条件[字段名] ?? ''
          let 筛选结果 = await 显示输入对话框('输入筛选条件:', 当前筛选值)
          if (筛选结果 !== null) {
            if (筛选结果 === '') {
              delete 上下文.筛选条件[字段名]
            } else {
              上下文.筛选条件[字段名] = 筛选结果
            }
            await 上下文.加载数据()
          }
        },
      })
      表头内容.appendChild(筛选图标)
    }
    th.appendChild(表头内容)
    th.style.position = 'relative'
    let 拖动句柄 = 创建元素('div', {
      style: { position: 'absolute', right: '0', top: '0', bottom: '0', width: '5px', backgroundColor: 'transparent' },
      onmouseenter: (): void => {
        拖动句柄.style.cursor = 'ew-resize'
      },
      onmouseleave: (): void => {
        拖动句柄.style.cursor = 'pointer'
      },
      onmousedown: (event: MouseEvent): void => {
        上下文.设置状态({
          拖动列索引: 列索引,
          拖动起始X: event.clientX,
          拖动起始宽度: th.offsetWidth,
          是否正在拖动: true,
        })
        document.onmousemove = 上下文.处理鼠标移动
        document.onmouseup = 上下文.处理鼠标释放
        event.preventDefault()
      },
    })
    th.appendChild(拖动句柄)
    if (列.可排序 === true) {
      let 执行排序 = async (): Promise<void> => {
        let 现有索引 = 上下文.排序列表.findIndex((项) => 项.field === 列.字段名)
        if (现有索引 !== -1) {
          let 当前项 = 上下文.排序列表[现有索引]
          if (当前项 !== void 0 && 当前项.direction === 'asc') {
            当前项.direction = 'desc'
          } else if (当前项 !== void 0) {
            上下文.排序列表.splice(现有索引, 1)
          }
        } else {
          上下文.排序列表.push({ field: 列.字段名, direction: 'asc' })
        }
        await 上下文.加载数据()
      }
      标签文本.style.cursor = 'pointer'
      标签文本.onclick = 执行排序
      标签文本.onmouseenter = (): void => {
        标签文本.style.color = 'var(--主色调)'
      }
      标签文本.onmouseleave = (): void => {
        标签文本.style.color = ''
      }
      let 排序项 = 上下文.排序列表.find((项) => 项.field === 列.字段名)
      let 指示器 = ''
      let 排序索引 = 上下文.排序列表.findIndex((项) => 项.field === 列.字段名)
      if (排序项 !== void 0) {
        if (排序项.direction === 'asc') {
          指示器 = ` ▲${排序索引}`
        } else {
          指示器 = ` ▼${排序索引}`
        }
      }
      标签文本.textContent = 列.显示名 + 指示器
    }
    表头行.appendChild(th)
  }
  for (let i = 0; i < 上下文.操作列表.length; i++) {
    let 操作 = 上下文.操作列表[i]
    if (操作 === void 0) continue
    let 操作th = 创建元素('th', {
      textContent: 操作.名称,
      style: {
        border: '1px solid var(--边框颜色)',
        padding: '8px',
        textAlign: 'center',
        backgroundColor: 'var(--color-background-secondary)',
        width: `${操作列宽度列表[i]}px`,
      },
    })
    表头行.appendChild(操作th)
  }
  表头.appendChild(表头行)
  return 表头
}

export function 渲染表体<数据项>(上下文: 表格渲染上下文<数据项>, 操作列宽度列表: number[]): HTMLTableSectionElement {
  let 表体 = 创建元素('tbody')
  if (上下文.数据列表.length === 0) {
    let 空行 = 创建元素('tr')
    let 列数 = 上下文.列配置.length + 上下文.操作列表.length
    let 空单元格 = 创建元素('td', {
      colSpan: 列数,
      textContent: '无数据',
      style: {
        textAlign: 'center',
        padding: '20px',
        border: '1px solid var(--边框颜色)',
        color: 'var(--color-text-secondary)',
      },
    })
    空行.appendChild(空单元格)
    表体.appendChild(空行)
  } else {
    for (let 行索引 = 0; 行索引 < 上下文.数据列表.length; 行索引++) {
      let 数据项 = 上下文.数据列表[行索引]
      if (数据项 === void 0 || 数据项 === null) continue

      let 行选中 = 上下文.选中的行.has(行索引)
      let 行 = 创建元素('tr', {
        style: {
          transition: 'background-color 0.2s',
          backgroundColor: 行选中 === true ? 'var(--选中背景颜色)' : '',
          cursor: 'pointer',
        },
        onmouseenter: (): void => {
          if (上下文.选中的行.has(行索引) === false) 行.style.backgroundColor = 'var(--color-background-hover)'
        },
        onmouseleave: (): void => {
          行.style.backgroundColor = 上下文.选中的行.has(行索引) === true ? 'var(--选中背景颜色)' : ''
        },
        onclick: (事件: MouseEvent): void => {
          事件.stopPropagation()
          上下文.处理行点击(行索引, 事件.ctrlKey, 事件.shiftKey)
          上下文.更新选中状态()
        },
        oncontextmenu: (事件: MouseEvent): void => {
          事件.preventDefault()
          事件.stopPropagation()
          if (上下文.选中的行.has(行索引) === false) {
            上下文.处理行点击(行索引, false, false)
            上下文.更新选中状态()
          }
          上下文.显示右键菜单(事件.clientX, 事件.clientY)
        },
      })
      上下文.表格行元素映射.set(行索引, 行)
      for (let 列索引 = 0; 列索引 < 上下文.列配置.length; 列索引++) {
        let 列 = 上下文.列配置[列索引]
        if (列 === void 0) continue
        let 数据 = 数据项[列.字段名]
        let 显示值 = 列.格式化 !== void 0 ? 列.格式化(数据) : 数据 === null || 数据 === void 0 ? 'NULL' : String(数据)
        let 列最大宽度 = 列.列最大宽度 ?? 上下文.列最大宽度
        let 单元格被强调 =
          上下文.最后点击的单元格 !== null &&
          上下文.最后点击的单元格.行 === 行索引 &&
          上下文.最后点击的单元格.列 === 列索引 &&
          上下文.多选模式 === false
        let td = 创建元素('td', {
          textContent: 显示值,
          title: 显示值,
          style: {
            padding: '8px',
            border: 单元格被强调 === true ? '2px solid var(--强调颜色)' : '1px solid var(--边框颜色)',
            backgroundColor: 单元格被强调 === true ? 'var(--强调背景颜色)' : '',
            minWidth: 列.列最小宽度 ?? 上下文.列最小宽度,
            ...(列最大宽度 !== void 0 ? { maxWidth: 列最大宽度, width: 列最大宽度 } : {}),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          },
          onclick: (事件: MouseEvent): void => {
            事件.stopPropagation()
            上下文.处理单元格点击(行索引, 列索引, 事件.ctrlKey, 事件.shiftKey)
            上下文.更新选中状态()
          },
          oncontextmenu: (事件: MouseEvent): void => {
            事件.preventDefault()
            事件.stopPropagation()
            if (
              上下文.选中的行.has(行索引) === false ||
              (上下文.选中的行.size === 1 &&
                (上下文.最后点击的单元格 === null ||
                  上下文.最后点击的单元格.行 !== 行索引 ||
                  上下文.最后点击的单元格.列 !== 列索引))
            ) {
              上下文.处理单元格点击(行索引, 列索引, false, false)
              上下文.更新选中状态()
            }
            上下文.显示右键菜单(事件.clientX, 事件.clientY)
          },
        })
        td.setAttribute('data-col-index', 列索引.toString())
        上下文.表格单元格元素映射.set(`${行索引}-${列索引}`, td)
        let 列单元格列表 = 上下文.列单元格映射.get(列索引) ?? []
        列单元格列表.push(td)
        上下文.列单元格映射.set(列索引, 列单元格列表)
        行.appendChild(td)
      }
      for (let i = 0; i < 上下文.操作列表.length; i++) {
        let 操作 = 上下文.操作列表[i]
        if (操作 === void 0) continue
        let 操作单元格 = 创建元素('td', {
          style: {
            padding: '8px',
            border: '1px solid var(--边框颜色)',
            textAlign: 'center',
            width: `${操作列宽度列表[i]}px`,
          },
        })
        let 按钮 = new 普通按钮({
          文本: 操作.名称,
          点击处理函数: async (): Promise<void> => {
            await 操作.回调(数据项)
            await 上下文.刷新数据()
          },
        })
        操作单元格.appendChild(按钮)
        行.appendChild(操作单元格)
      }
      表体.appendChild(行)
    }
  }
  return 表体
}
