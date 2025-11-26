import { 组件基类 } from '../../../base/base'
import { 创建元素, 增强样式类型 } from '../../../global/create-element'

type 下拉框属性 = {}

type 下拉框事件 = {
  变化: string
  焦点: void
  失焦: string
}

type 监听下拉框事件 = {}

type 选项类型 = {
  值: string
  文本: string
  禁用?: boolean
}

type 下拉框配置 = {
  选项列表?: 选项类型[]
  值?: string
  禁用?: boolean
  占位符?: string
  变化处理函数?: (值: string) => void | Promise<void>
  焦点处理函数?: () => void | Promise<void>
  失焦处理函数?: (值: string) => void | Promise<void>
  字体大小?: string
  宽度?: string
  内边距?: string
  边框颜色?: string
  背景颜色?: string
  文字颜色?: string
}

abstract class 下拉框基类 extends 组件基类<下拉框属性, 下拉框事件, 监听下拉框事件> {
  protected 配置: 下拉框配置
  private 下拉框元素?: HTMLSelectElement

  public constructor(配置: 下拉框配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    let 下拉框元素 = 创建元素('select', {
      style: this.获得下拉框样式对象(),
    })

    if (this.配置.占位符 !== void 0) {
      let 占位符选项 = 创建元素('option', {
        value: '',
        textContent: this.配置.占位符,
        disabled: true,
        selected: true,
      })
      下拉框元素.appendChild(占位符选项)
    }

    if (this.配置.选项列表 !== void 0) {
      for (let 选项 of this.配置.选项列表) {
        let 选项元素 = 创建元素('option', {
          value: 选项.值,
          textContent: 选项.文本,
          disabled: 选项.禁用 ?? false,
        })
        下拉框元素.appendChild(选项元素)
      }
    }

    if (this.配置.值 !== void 0) {
      下拉框元素.value = this.配置.值
    }

    if (this.配置.禁用 === true) {
      下拉框元素.disabled = true
    }

    下拉框元素.onchange = async (e: Event): Promise<void> => {
      let 值 = (e.target as HTMLSelectElement).value
      await this.配置.变化处理函数?.(值)
      this.派发事件('变化', 值)
    }
    下拉框元素.onfocus = async (): Promise<void> => {
      await this.配置.焦点处理函数?.()
      this.派发事件('焦点', void 0)
    }
    下拉框元素.onblur = async (): Promise<void> => {
      let 值 = 下拉框元素.value
      await this.配置.失焦处理函数?.(值)
      this.派发事件('失焦', 值)
    }

    this.shadow.appendChild(下拉框元素)
    this.下拉框元素 = 下拉框元素
  }

  protected abstract 获得下拉框样式对象(): 增强样式类型

  public 设置值(值: string): void {
    this.配置.值 = 值
    if (this.下拉框元素 !== void 0) {
      this.下拉框元素.value = 值
    }
  }

  public 获得值(): string {
    return this.下拉框元素?.value ?? this.配置.值 ?? ''
  }

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    if (this.下拉框元素 !== void 0) {
      this.下拉框元素.disabled = 值
    }
  }

  public 获得禁用(): boolean {
    return this.配置.禁用 ?? false
  }

  public 设置选项列表(选项列表: 选项类型[]): void {
    this.配置.选项列表 = 选项列表
    if (this.下拉框元素 !== void 0) {
      // 清空现有选项
      this.下拉框元素.innerHTML = ''
      if (this.配置.占位符 !== void 0) {
        let 占位符选项 = 创建元素('option', {
          value: '',
          textContent: this.配置.占位符,
          disabled: true,
          selected: true,
        })
        this.下拉框元素.appendChild(占位符选项)
      }
      for (let 选项 of 选项列表) {
        let 选项元素 = 创建元素('option', {
          value: 选项.值,
          textContent: 选项.文本,
          disabled: 选项.禁用 ?? false,
        })
        this.下拉框元素.appendChild(选项元素)
      }
    }
  }
}

export class 普通下拉框 extends 下拉框基类 {
  protected 获得下拉框样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      width: this.配置.宽度 ?? '100%',
      padding: this.配置.内边距 ?? '8px 12px',
      fontSize: this.配置.字体大小 ?? '14px',
      border: `1px solid ${this.配置.边框颜色 ?? 'var(--边框颜色)'}`,
      borderRadius: '4px',
      backgroundColor: 禁用 ? 'var(--禁用背景)' : (this.配置.背景颜色 ?? 'var(--输入框背景)'),
      color: this.配置.文字颜色 ?? 'var(--文字颜色)',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.6' : '1',
      outline: 'none',
      boxSizing: 'border-box',
    }
  }
}

// 注册组件
普通下拉框.注册组件('lsby-select-default', 普通下拉框)
