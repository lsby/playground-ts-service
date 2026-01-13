import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/manager/api-manager'
import { 主题管理器 } from '../../global/manager/theme-manager'
import { 成功提示 } from '../../global/manager/toast-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 主要按钮 } from '../general/base/base-button'
import { 表单, 表单项配置 } from '../general/form/form'
import { 复选框 } from '../general/form/form-checkbox'
import { 单选框组 } from '../general/form/form-radio-group'

type 设置属性 = {}
type 设置事件 = {}
type 监听设置事件 = {}

type 系统配置数据 = { id: string; enable_register: boolean; is_initialized: boolean }
type 用户配置数据 = { id: string; theme: '系统' | '亮色' | '暗色' }

export class 用户设置组件 extends 组件基类<设置属性, 设置事件, 监听设置事件> {
  private 用户信息?: { id: string; name: string; is_admin: boolean }
  private 系统配置表单?: 表单<系统配置数据>
  private 用户配置表单?: 表单<用户配置数据>

  static {
    this.注册组件('lsby-settings', this)
  }

  public constructor() {
    super({})
  }

  protected async 当加载时(): Promise<void> {
    // 获取用户信息
    this.用户信息 = await API管理器.请求postJson并处理错误('/api/user/get-current-user', {})

    let 容器 = 创建元素('div', { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' } })

    // 如果是管理员，显示系统配置
    if (this.用户信息.is_admin) {
      let 系统配置标题 = 创建元素('h2', {
        textContent: '系统配置',
        style: { margin: '0', fontSize: '18px', color: 'var(--文字颜色)' },
      })
      容器.appendChild(系统配置标题)

      this.系统配置表单 = this.创建系统配置表单()
      容器.appendChild(this.系统配置表单)
    }

    // 用户配置
    let 用户配置标题 = 创建元素('h2', {
      textContent: '用户配置',
      style: { margin: '0', fontSize: '18px', color: 'var(--文字颜色)' },
    })
    容器.appendChild(用户配置标题)

    this.用户配置表单 = this.创建用户配置表单()
    容器.appendChild(this.用户配置表单)

    // 添加统一的保存按钮
    let 保存按钮容器 = 创建元素('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '16px' } })
    let 保存按钮 = new 主要按钮({
      文本: '保存',
      点击处理函数: async (): Promise<void> => {
        await this.保存所有配置()
      },
    })
    保存按钮容器.appendChild(保存按钮)
    容器.appendChild(保存按钮容器)

    this.shadow.appendChild(容器)

    // 加载数据
    await this.加载数据()
  }

  private 创建系统配置表单(): 表单<系统配置数据> {
    let 项列表: 表单项配置[] = [{ 键: 'enable_register', 组件: new 复选框({ 标签: '启用注册' }), 宽度: 1 }]

    let 表单实例 = new 表单<系统配置数据>({ 项列表, 元素样式: { gridTemplateColumns: '1fr' } })

    return 表单实例
  }

  private 创建用户配置表单(): 表单<用户配置数据> {
    let 项列表: 表单项配置[] = [
      { 键: 'theme', 组件: new 单选框组({ 选项列表: ['系统', '亮色', '暗色'], 方向: '横', 标签: '主题' }), 宽度: 1 },
    ]

    let 表单实例 = new 表单<用户配置数据>({ 项列表, 元素样式: { gridTemplateColumns: '1fr' } })

    return 表单实例
  }

  private async 加载数据(): Promise<void> {
    if (this.用户信息 !== void 0 && this.用户信息.is_admin && this.系统配置表单 !== void 0) {
      let 系统配置 = await API管理器.请求postJson并处理错误('/api/system/get-system-config', {})
      this.系统配置表单.设置数据(系统配置)
    }

    if (this.用户配置表单 !== void 0) {
      let 用户配置 = await API管理器.请求postJson并处理错误('/api/system/get-user-config', {})
      this.用户配置表单.设置数据(用户配置)
    }
  }

  private async 保存系统配置(): Promise<void> {
    if (this.系统配置表单 === void 0) return
    let 数据 = this.系统配置表单.获得数据()
    await API管理器.请求postJson并处理错误('/api/system/update-system-config', 数据)
  }

  private async 保存用户配置(): Promise<void> {
    if (this.用户配置表单 === void 0) return
    let 数据 = this.用户配置表单.获得数据()
    await 主题管理器.设置主题(数据.theme)
  }

  private async 保存所有配置(): Promise<void> {
    if (this.用户信息 !== void 0 && this.用户信息.is_admin && this.系统配置表单 !== void 0) await this.保存系统配置()
    await this.保存用户配置()
    成功提示('保存成功')
  }
}
