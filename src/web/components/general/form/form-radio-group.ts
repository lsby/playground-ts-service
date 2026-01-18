import { 增强样式类型 } from 'src/web/global/types/style'
import { 组件基类 } from '../../../base/base'
import { 创建元素, 应用宿主样式 } from '../../../global/tools/create-element'
import type { 表单元素 } from './form'

type 单选框组属性 = {}

type 单选框组事件 = { 变化: string }

type 监听单选框组事件 = {}

type 单选框组配置 = {
  选项列表?: string[]
  值?: string
  禁用?: boolean
  变化处理函数?: (值: string) => void | Promise<void>
  宿主样式?: 增强样式类型
  元素样式?: 增强样式类型
  方向?: '横' | '竖'
  标签?: string
}

class 单选框组 extends 组件基类<单选框组属性, 单选框组事件, 监听单选框组事件> implements 表单元素<string> {
  protected 配置: 单选框组配置
  private 单选框元素们: HTMLInputElement[] = []

  public constructor(配置: 单选框组配置 = {}) {
    super({})
    this.配置 = 配置
  }

  protected async 当加载时(): Promise<void> {
    应用宿主样式(this.获得宿主样式(), this.配置.宿主样式)

    if (this.配置.标签 !== void 0) {
      let 标签元素 = 创建元素('label', {
        textContent: this.配置.标签,
        style: { display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--文字颜色)' },
      })
      this.shadow.appendChild(标签元素)
    }

    let 容器 = 创建元素('div', {
      style: { display: 'flex', flexDirection: this.配置.方向 === '横' ? 'row' : 'column', gap: '8px' },
    })

    if (this.配置.选项列表 !== void 0) {
      for (let 选项 of this.配置.选项列表) {
        let 选项容器 = 创建元素('label', {
          style: {
            display: 'flex',
            alignItems: 'center',
            cursor: (this.配置.禁用 ?? false) ? 'not-allowed' : 'pointer',
          },
        })

        let 单选框 = 创建元素('input', {
          type: 'radio',
          name: 'radio-group',
          value: 选项,
          checked: this.配置.值 === 选项,
          disabled: this.配置.禁用 ?? false,
          style: { marginRight: '8px' },
        })

        let 文本 = 创建元素('span', { textContent: 选项 })

        单选框.onchange = async (): Promise<void> => {
          let 值 = 单选框.value
          await this.配置.变化处理函数?.(值)
          this.派发事件('变化', 值)
        }

        选项容器.appendChild(单选框)
        选项容器.appendChild(文本)
        容器.appendChild(选项容器)
        this.单选框元素们.push(单选框)
      }
    }

    this.shadow.appendChild(容器)
  }

  public 设置值(值: string): void {
    this.配置.值 = 值
    for (let 单选框 of this.单选框元素们) {
      单选框.checked = 单选框.value === 值
    }
  }

  public 获得值(): string {
    return this.单选框元素们.find((单选框) => 单选框.checked)?.value ?? ''
  }

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    for (let 单选框 of this.单选框元素们) {
      单选框.disabled = 值
    }
  }
}

// 注册组件
单选框组.注册组件('lsby-form-radio-group', 单选框组)

export { 单选框组 }
