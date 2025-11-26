import { 组件基类 } from '../../../base/base'
import { 创建元素, 增强样式类型 } from '../../../global/create-element'

type 按钮属性 = {}

type 按钮事件 = {
  点击: void
}

type 监听按钮事件 = {}

type 按钮配置 = {
  文本?: string
  禁用?: boolean
  点击处理函数?: (e: Event) => void | Promise<void>
  悬浮效果类型?: '背景' | '透明度'
  字体大小?: string
  颜色?: string
  样式?: 增强样式类型
}

abstract class 按钮基类 extends 组件基类<按钮属性, 按钮事件, 监听按钮事件> {
  protected 配置: 按钮配置
  private 按钮元素?: HTMLButtonElement

  public constructor(配置: 按钮配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    // 应用宿主样式
    if (this.配置.样式 !== void 0) {
      for (let 键 in this.配置.样式) {
        if (this.配置.样式[键] !== void 0) {
          ;(this.获得宿主样式() as any)[键] = this.配置.样式[键]
        }
      }
    }

    let 按钮元素 = 创建元素('button', {
      style: this.获得按钮样式对象(),
    })
    if (this.配置.文本 !== void 0) {
      let 文本元素 = 创建元素('span', { textContent: this.配置.文本 })
      按钮元素.appendChild(文本元素)
    }
    if (this.配置.禁用 === true) {
      按钮元素.disabled = true
    }
    // 添加 hover 效果
    let 初始背景色 = this.获得按钮样式对象().backgroundColor ?? 'var(--按钮背景)'
    let 初始透明度 = 按钮元素.style.opacity !== '' ? 按钮元素.style.opacity : '1'
    按钮元素.onmouseenter = (): void => {
      if (this.配置.禁用 !== true) {
        if (this.配置.悬浮效果类型 === '透明度') {
          按钮元素.style.opacity = '1'
        } else {
          按钮元素.style.backgroundColor = 'var(--悬浮背景颜色)'
        }
      }
    }
    按钮元素.onmouseleave = (): void => {
      if (this.配置.禁用 !== true) {
        if (this.配置.悬浮效果类型 === '透明度') {
          按钮元素.style.opacity = 初始透明度
        } else {
          按钮元素.style.backgroundColor = 初始背景色
        }
      }
    }
    按钮元素.onclick = async (e: MouseEvent): Promise<void> => {
      e.preventDefault()
      if (this.配置.禁用 === true) return
      await this.配置.点击处理函数?.(e)
      this.派发事件('点击', void 0)
    }
    this.shadow.appendChild(按钮元素)
    this.按钮元素 = 按钮元素
  }

  protected abstract 获得按钮样式对象(): 增强样式类型

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    if (this.按钮元素 !== void 0) {
      this.按钮元素.disabled = 值
    }
  }

  public 获得禁用(): boolean {
    return this.配置.禁用 ?? false
  }
}

export class 普通按钮 extends 按钮基类 {
  protected 获得按钮样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      backgroundColor: 'var(--按钮背景)',
      color: 'var(--按钮文字)',
      border: '1px solid var(--边框颜色)',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.5' : '1',
    }
  }
}

export class 主要按钮 extends 按钮基类 {
  protected 获得按钮样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      backgroundColor: 禁用 ? 'var(--按钮背景)' : 'var(--主色调)',
      color: 禁用 ? 'var(--按钮文字)' : 'white',
      border: `1px solid ${禁用 ? 'var(--边框颜色)' : 'var(--主色调)'}`,
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.5' : '1',
    }
  }
}

export class 危险按钮 extends 按钮基类 {
  protected 获得按钮样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      backgroundColor: 禁用 ? 'var(--按钮背景)' : 'var(--错误颜色)',
      color: 禁用 ? 'var(--按钮文字)' : 'white',
      border: `1px solid ${禁用 ? 'var(--边框颜色)' : 'var(--错误颜色)'}`,
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.5' : '1',
    }
  }
}

export class 成功按钮 extends 按钮基类 {
  protected 获得按钮样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      backgroundColor: 禁用 ? 'var(--按钮背景)' : 'var(--成功颜色)',
      color: 禁用 ? 'var(--按钮文字)' : 'white',
      border: `1px solid ${禁用 ? 'var(--边框颜色)' : 'var(--成功颜色)'}`,
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.5' : '1',
    }
  }
}

export class 警告按钮 extends 按钮基类 {
  protected 获得按钮样式对象(): 增强样式类型 {
    let 禁用 = this.配置.禁用 ?? false
    return {
      backgroundColor: 禁用 ? 'var(--按钮背景)' : 'var(--警告颜色)',
      color: 禁用 ? 'var(--按钮文字)' : 'white',
      border: `1px solid ${禁用 ? 'var(--边框颜色)' : 'var(--警告颜色)'}`,
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 禁用 ? 'not-allowed' : 'pointer',
      opacity: 禁用 ? '0.5' : '1',
    }
  }
}

// 注册组件
普通按钮.注册组件('lsby-button-default', 普通按钮)
主要按钮.注册组件('lsby-button-primary', 主要按钮)
危险按钮.注册组件('lsby-button-danger', 危险按钮)
成功按钮.注册组件('lsby-button-success', 成功按钮)
警告按钮.注册组件('lsby-button-warning', 警告按钮)
