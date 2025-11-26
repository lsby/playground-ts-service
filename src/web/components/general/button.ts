import { 组件基类 } from '../../base/base'
import { 创建元素, 增强样式类型 } from '../../global/create-element'

type 按钮属性 = {}

type 按钮事件 = {
  点击: void
}

type 监听按钮事件 = {}

type 按钮配置 = {
  文本?: string
  禁用?: boolean
  点击处理函数?: (e: Event) => void
}

abstract class 按钮基类 extends 组件基类<按钮属性, 按钮事件, 监听按钮事件> {
  protected 配置: 按钮配置

  public constructor(配置: 按钮配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    let 按钮元素 = 创建元素('button', {
      textContent: this.配置.文本 ?? '',
      style: this.获得按钮样式对象(),
    })
    if (this.配置.禁用 === true) {
      按钮元素.disabled = true
    }
    // 添加 hover 效果
    let 初始背景色 = this.获得按钮样式对象().backgroundColor ?? 'var(--按钮背景)'
    按钮元素.addEventListener('mouseenter', () => {
      if (this.配置.禁用 !== true) {
        按钮元素.style.backgroundColor = 'var(--悬浮背景颜色)'
      }
    })
    按钮元素.addEventListener('mouseleave', () => {
      if (this.配置.禁用 !== true) {
        按钮元素.style.backgroundColor = 初始背景色
      }
    })
    按钮元素.addEventListener('click', async (e) => {
      e.preventDefault()
      if (this.配置.禁用 === true) return
      this.配置.点击处理函数?.(e)
      this.派发事件('点击', void 0)
    })
    this.shadow.appendChild(按钮元素)
  }

  protected abstract 获得按钮样式对象(): 增强样式类型
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
