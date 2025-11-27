import { 组件基类 } from '../../../base/base'
import { 创建元素, 增强样式类型, 应用宿主样式 } from '../../../global/create-element'

type 基础值 = string | number | boolean | null
type 基础值结构 = 基础值 | 基础值结构[] | { [键: string]: 基础值结构 }

interface 表单元素<值类型 extends 基础值结构 = 基础值结构> extends HTMLElement {
  获得值(): 值类型
  设置值(值: 值类型): void
}

interface 表单项配置<值类型 extends 基础值结构 = 基础值结构> {
  键: string
  组件: 表单元素<值类型>
  排版?: '全宽' | '半宽'
  标签?: string
}

type 表单属性 = {}
type 表单事件<数据类型 extends Record<string, 基础值结构> = Record<string, 基础值结构>> = {
  变化: 数据类型
}
type 监听表单事件 = {}

type 表单配置<_数据类型 extends Record<string, 基础值结构> = Record<string, 基础值结构>> = {
  项列表: 表单项配置[]
  宿主样式?: 增强样式类型
  元素样式?: 增强样式类型
}

class 表单<数据类型 extends Record<string, 基础值结构> = Record<string, 基础值结构>> extends 组件基类<
  表单属性,
  表单事件<数据类型>,
  监听表单事件
> {
  private 配置: 表单配置<数据类型>
  private 项映射: Map<string, 表单元素> = new Map()

  public constructor(配置: 表单配置) {
    super({})
    this.配置 = 配置
    for (let 项 of 配置.项列表) {
      this.项映射.set(项.键, 项.组件)
    }
  }

  protected async 当加载时(): Promise<void> {
    应用宿主样式(this.获得宿主样式(), this.配置.宿主样式)

    let 容器样式: 增强样式类型 = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    }
    if (this.配置.元素样式 !== void 0) {
      容器样式 = { ...容器样式, ...this.配置.元素样式 }
    }

    let 容器 = 创建元素('div', {
      style: 容器样式,
    })

    for (let 项配置 of this.配置.项列表) {
      // 创建项包装器，使用 flex 布局
      let 排版 = 项配置.排版 ?? '全宽'
      let 项包装器 = 创建元素('div', {
        style: {
          gridColumn: 排版 === '全宽' ? 'span 2' : 'span 1',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '0',
        },
      })

      // 如果有标签，添加标签
      if (项配置.标签 !== void 0) {
        let 标签元素 = 创建元素('span', {
          textContent: 项配置.标签,
          style: {
            fontSize: '14px',
            color: 'var(--文字颜色)',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
          },
        })
        项包装器.appendChild(标签元素)
      }

      // 添加组件
      let 组件包装器 = 创建元素('div', {
        style: {
          minWidth: '0',
          flex: '1',
        },
      })

      let 组件元素 = 项配置.组件
      组件包装器.appendChild(组件元素)
      项包装器.appendChild(组件包装器)
      容器.appendChild(项包装器)
    }

    this.shadow.appendChild(容器)
  }

  public 获得数据(): 数据类型 {
    let 数据: Record<string, 基础值结构> = {}
    for (let [键, 元素] of this.项映射) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let 值 = 元素.获得值()
      数据[键] = 值
    }
    return 数据 as 数据类型
  }

  public 设置数据(数据: 数据类型): void {
    for (let [键, 值] of Object.entries(数据)) {
      let 元素 = this.项映射.get(键)
      if (元素 !== void 0) {
        元素.设置值(值)
      }
    }
  }

  public 获得项值(键: keyof 数据类型): 基础值结构 {
    let 值 = this.项映射.get(键 as string)?.获得值()
    return 值 ?? null
  }

  public 设置项值(键: keyof 数据类型, 值: 基础值结构): void {
    this.项映射.get(键 as string)?.设置值(值)
  }

  public 获得所有元素(): Partial<Record<keyof 数据类型, HTMLElement>> {
    let 元素映射: Partial<Record<keyof 数据类型, HTMLElement>> = {}
    for (let [键, _元素] of this.项映射) {
      let dom元素 = _元素
      if (dom元素 instanceof HTMLElement) {
        元素映射[键 as keyof 数据类型] = dom元素
      }
    }
    return 元素映射
  }
}

// 注册组件
表单.注册组件('lsby-form', 表单)

export { 基础值, 基础值结构, 表单, 表单元素, 表单配置, 表单项配置 }
