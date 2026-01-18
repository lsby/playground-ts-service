import { 增强样式类型 } from 'src/web/global/types/style'
import { 组件基类 } from '../../../base/base'
import { 创建元素, 应用宿主样式 } from '../../../global/tools/create-element'
import type { 表单元素 } from './form'

type 复选框属性 = {}

type 复选框事件 = { 变化: boolean }

type 监听复选框事件 = {}

type 复选框配置 = {
  标签?: string
  值?: boolean
  禁用?: boolean
  变化处理函数?: (值: boolean) => void | Promise<void>
  宿主样式?: 增强样式类型
  元素样式?: 增强样式类型
}

class 复选框 extends 组件基类<复选框属性, 复选框事件, 监听复选框事件> implements 表单元素<boolean> {
  protected 配置: 复选框配置
  private 复选框元素?: HTMLInputElement

  public constructor(配置: 复选框配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    应用宿主样式(this.获得宿主样式(), this.配置.宿主样式)

    let 容器 = 创建元素('label', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: (this.配置.禁用 ?? false) ? 'not-allowed' : 'pointer',
        ...this.配置.元素样式,
      },
    })

    let 复选框元素 = 创建元素('input', {
      type: 'checkbox',
      checked: this.配置.值 ?? false,
      disabled: this.配置.禁用 ?? false,
      style: { width: '20px', height: '20px' },
    })

    复选框元素.onchange = async (): Promise<void> => {
      let 值 = 复选框元素.checked
      await this.配置.变化处理函数?.(值)
      this.派发事件('变化', 值)
    }

    容器.appendChild(复选框元素)

    if (this.配置.标签 !== void 0) {
      let 标签元素 = 创建元素('span', { textContent: this.配置.标签 })
      容器.appendChild(标签元素)
    }

    this.shadow.appendChild(容器)
    this.复选框元素 = 复选框元素
  }

  public 设置值(值: boolean): void {
    this.配置.值 = 值
    if (this.复选框元素 !== void 0) {
      this.复选框元素.checked = 值
    }
  }

  public 获得值(): boolean {
    return this.复选框元素?.checked ?? this.配置.值 ?? false
  }

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    if (this.复选框元素 !== void 0) {
      this.复选框元素.disabled = 值
    }
  }
}

// 注册组件
复选框.注册组件('lsby-form-checkbox', 复选框)

export { 复选框 }
