import { 增强样式类型 } from 'src/web/global/types/style'

export type 数据表列配置<数据项> = {
  字段名: keyof 数据项
  显示名: string
  格式化?: (值: unknown) => string
  可排序?: boolean
  可筛选?: boolean
  列最小宽度?: string
  列最大宽度?: string
  渲染函数?: (值: any, 行: 数据项) => HTMLElement | string
}

export type 数据表操作配置<数据项> = { 名称: string; 回调: (数据项: 数据项) => Promise<void> }

export type 顶部操作配置 = { 名称: string; 回调: () => Promise<void> }

export type 数据表加载数据参数<数据项> = {
  页码: number
  每页数量: number
  排序列表?: { field: keyof 数据项; direction: 'asc' | 'desc' }[]
  筛选条件?: Record<string, string>
}

export type 数据表格选项<数据项> = {
  列配置: 数据表列配置<数据项>[]
  操作列表?: 数据表操作配置<数据项>[]
  顶部操作列表?: 顶部操作配置[]
  每页数量?: number
  列最小宽度?: string
  列最大宽度?: string
  宿主样式?: 增强样式类型
  加载数据: (参数: 数据表加载数据参数<数据项>) => Promise<{ 数据: 数据项[]; 总数: number }>
}

export type 发出事件类型<数据项> = { 操作点击: { 操作名: string; 数据项: 数据项 }; 页码变化: { 页码: number } }

export type 监听事件类型 = {}
