import { 组件基类 } from '../../base/base'
import { 创建元素, 增强样式类型 } from '../../global/create-element'

type 输入框属性 = {}

type 输入框事件 = {
  输入: string
  变化: string
  焦点: void
  失焦: void
}

type 监听输入框事件 = {}

type 输入框配置 = {
  占位符?: string
  值?: string
  禁用?: boolean
  只读?: boolean
  类型?: string
  输入处理函数?: (值: string) => void | Promise<void>
  变化处理函数?: (值: string) => void | Promise<void>
  焦点处理函数?: () => void | Promise<void>
  失焦处理函数?: (值: string) => void | Promise<void>
  字体大小?: string
  宽度?: string
  图标?: string
  内边距?: string
  边框颜色?: string
  背景颜色?: string
  文字颜色?: string
}

abstract class 输入框基类 extends 组件基类<输入框属性, 输入框事件, 监听输入框事件> {
  protected 配置: 输入框配置
  private 输入框元素?: HTMLInputElement

  public constructor(配置: 输入框配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    let 容器 = 创建元素('div', {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: this.配置.宽度 ?? '100%',
      },
    })

    let 输入框元素 = 创建元素('input', {
      type: this.配置.类型 ?? 'text',
      placeholder: this.配置.占位符 ?? '',
      value: this.配置.值 ?? '',
      style: this.获得输入框样式对象(),
    })

    if (this.配置.图标 !== void 0) {
      let 占位符 = this.配置.占位符 ?? ''
      输入框元素.placeholder = this.配置.图标 + ' ' + 占位符
    }

    if (this.配置.禁用 === true) {
      输入框元素.disabled = true
    }
    if (this.配置.只读 === true) {
      输入框元素.readOnly = true
    }

    输入框元素.oninput = async (e: Event): Promise<void> => {
      let 值 = (e.target as HTMLInputElement).value
      await this.配置.输入处理函数?.(值)
    }
    输入框元素.onchange = async (e: Event): Promise<void> => {
      let 值 = (e.target as HTMLInputElement).value
      await this.配置.变化处理函数?.(值)
    }
    输入框元素.onfocus = async (): Promise<void> => {
      await this.配置.焦点处理函数?.()
    }
    输入框元素.onblur = async (): Promise<void> => {
      let 值 = 输入框元素.value
      await this.配置.失焦处理函数?.(值)
    }

    容器.appendChild(输入框元素)
    this.shadow.appendChild(容器)
    this.输入框元素 = 输入框元素
  }

  protected abstract 获得输入框样式对象(): 增强样式类型

  public 设置值(值: string): void {
    this.配置.值 = 值
    if (this.输入框元素 !== void 0) {
      this.输入框元素.value = 值
    }
  }

  public 获得值(): string {
    return this.输入框元素?.value ?? this.配置.值 ?? ''
  }

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    if (this.输入框元素 !== void 0) {
      this.输入框元素.disabled = 值
    }
  }

  public 获得禁用(): boolean {
    return this.配置.禁用 ?? false
  }

  public 设置只读(值: boolean): void {
    this.配置.只读 = 值
    if (this.输入框元素 !== void 0) {
      this.输入框元素.readOnly = 值
    }
  }

  public 获得只读(): boolean {
    return this.配置.只读 ?? false
  }

  public 聚焦(): void {
    this.输入框元素?.focus()
  }

  public 失焦(): void {
    this.输入框元素?.blur()
  }

  public 设置占位符(占位符: string): void {
    this.配置.占位符 = 占位符
    if (this.输入框元素 !== void 0) {
      let 最终占位符 = 占位符
      if (this.配置.图标 !== void 0) {
        最终占位符 = this.配置.图标 + ' ' + 占位符
      }
      this.输入框元素.placeholder = 最终占位符
    }
  }
}

export class 普通输入框 extends 输入框基类 {
  protected 获得输入框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: '8px 12px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: '1px solid var(--边框颜色)',
      borderRadius: '4px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : 'var(--输入框背景)',
      color: 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'text',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
    }
  }
}

export class 主要输入框 extends 输入框基类 {
  protected 获得输入框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: '8px 12px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: `2px solid ${禁用 ? 'var(--边框颜色)' : 'var(--主色调)'}`,
      borderRadius: '4px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : 'var(--输入框背景)',
      color: 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'text',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
    }
  }
}

export class 搜索输入框 extends 输入框基类 {
  protected 获得输入框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: '10px 16px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: '1px solid var(--边框颜色)',
      borderRadius: '20px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : 'var(--输入框背景)',
      color: 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'text',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
    }
  }
}

export class 密码输入框 extends 输入框基类 {
  public constructor(配置: 输入框配置 = {}) {
    配置.类型 = 'password'
    super(配置)
  }

  protected 获得输入框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: '8px 12px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: '1px solid var(--边框颜色)',
      borderRadius: '4px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : 'var(--输入框背景)',
      color: 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'text',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
      letterSpacing: '2px',
    }
  }
}

export class 数字输入框 extends 输入框基类 {
  public constructor(配置: 输入框配置 = {}) {
    配置.类型 = 'number'
    super(配置)
  }

  protected 获得输入框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: '8px 12px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: '1px solid var(--边框颜色)',
      borderRadius: '4px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : 'var(--输入框背景)',
      color: 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'text',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
      // textAlign: 'right',
    }
  }
}

// 注册组件
普通输入框.注册组件('lsby-input-default', 普通输入框)
主要输入框.注册组件('lsby-input-primary', 主要输入框)
搜索输入框.注册组件('lsby-input-search', 搜索输入框)
密码输入框.注册组件('lsby-input-password', 密码输入框)
数字输入框.注册组件('lsby-input-number', 数字输入框)
