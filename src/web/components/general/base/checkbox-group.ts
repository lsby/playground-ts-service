import { 组件基类 } from '../../../base/base'
import { 创建元素, 增强样式类型 } from '../../../global/create-element'

type 复选框组属性 = {}

type 复选框组事件 = {
  变化: string[]
}

type 监听复选框组事件 = {}

type 复选框组配置 = {
  选项列表?: string[]
  选中值列表?: string[]
  禁用?: boolean
  变化处理函数?: (选中值列表: string[]) => void | Promise<void>
  样式?: 增强样式类型
}

class 复选框组 extends 组件基类<复选框组属性, 复选框组事件, 监听复选框组事件> {
  protected 配置: 复选框组配置
  private 复选框元素们: HTMLInputElement[] = []

  public constructor(配置: 复选框组配置 = {}) {
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

    let 容器 = 创建元素('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      },
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

        let 复选框 = 创建元素('input', {
          type: 'checkbox',
          value: 选项,
          checked: this.配置.选中值列表?.includes(选项) ?? false,
          disabled: this.配置.禁用 ?? false,
          style: {
            marginRight: '8px',
          },
        })

        let 文本 = 创建元素('span', {
          textContent: 选项,
        })

        复选框.onchange = async (): Promise<void> => {
          let 选中值列表 = this.获得选中值列表()
          await this.配置.变化处理函数?.(选中值列表)
          this.派发事件('变化', 选中值列表)
        }

        选项容器.appendChild(复选框)
        选项容器.appendChild(文本)
        容器.appendChild(选项容器)
        this.复选框元素们.push(复选框)
      }
    }

    this.shadow.appendChild(容器)
  }

  public 设置选中值列表(选中值列表: string[]): void {
    this.配置.选中值列表 = 选中值列表
    for (let 复选框 of this.复选框元素们) {
      复选框.checked = 选中值列表.includes(复选框.value)
    }
  }

  public 获得选中值列表(): string[] {
    return this.复选框元素们.filter((复选框) => 复选框.checked).map((复选框) => 复选框.value)
  }

  public 设置禁用(值: boolean): void {
    this.配置.禁用 = 值
    for (let 复选框 of this.复选框元素们) {
      复选框.disabled = 值
    }
  }
}

// 注册组件
复选框组.注册组件('lsby-checkbox-group', 复选框组)

export { 复选框组 }
