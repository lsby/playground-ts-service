import { 组件基类 } from '../../base/base'

type 属性类型 = {}

type 发出事件类型 = {
  页码变化: { 页码: number }
}

type 监听事件类型 = {}

export type 分页配置 = {
  当前页码: number
  每页数量: number
  总数量: number
}

export class LsbyPagination extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-pagination', this)
  }

  private 配置: 分页配置 = {
    当前页码: 1,
    每页数量: 10,
    总数量: 0,
  }

  private 页码变化回调: ((页码: number) => Promise<void>) | null = null

  public 设置配置(配置: 分页配置): void {
    this.配置 = 配置
    this.渲染().catch(console.error)
  }

  public 获得当前页码(): number {
    return this.配置.当前页码
  }

  public 获得每页数量(): number {
    return this.配置.每页数量
  }

  public 设置页码变化回调(回调: (页码: number) => Promise<void>): void {
    this.页码变化回调 = 回调
  }

  private async 渲染(): Promise<void> {
    let { 当前页码, 每页数量, 总数量 } = this.配置
    let 总页数 = Math.ceil(总数量 / 每页数量)

    let 容器 = document.createElement('div')
    容器.style.display = 'flex'
    容器.style.justifyContent = 'center'
    容器.style.alignItems = 'center'
    容器.style.gap = '12px'
    容器.style.padding = '16px 0'

    // 上一页按钮
    let 上一页按钮 = document.createElement('button')
    上一页按钮.textContent = '上一页'
    上一页按钮.disabled = 当前页码 <= 1
    上一页按钮.style.padding = '6px 16px'
    上一页按钮.style.cursor = 当前页码 <= 1 ? 'not-allowed' : 'pointer'
    上一页按钮.onclick = async (): Promise<void> => {
      if (当前页码 > 1) {
        this.配置.当前页码 = 当前页码 - 1
        await this.渲染()
        this.派发事件('页码变化', { 页码: this.配置.当前页码 })
        if (this.页码变化回调 !== null) {
          await this.页码变化回调(this.配置.当前页码)
        }
      }
    }
    容器.appendChild(上一页按钮)

    // 页码显示
    let 页码显示 = document.createElement('span')
    页码显示.textContent = `第 ${当前页码} 页 / 共 ${总页数} 页 (总共 ${总数量} 条)`
    页码显示.style.margin = '0 8px'
    页码显示.style.color = 'var(--color-text-secondary)'
    容器.appendChild(页码显示)

    // 下一页按钮
    let 下一页按钮 = document.createElement('button')
    下一页按钮.textContent = '下一页'
    下一页按钮.disabled = 当前页码 >= 总页数
    下一页按钮.style.padding = '6px 16px'
    下一页按钮.style.cursor = 当前页码 >= 总页数 ? 'not-allowed' : 'pointer'
    下一页按钮.onclick = async (): Promise<void> => {
      if (当前页码 < 总页数) {
        this.配置.当前页码 = 当前页码 + 1
        await this.渲染()
        this.派发事件('页码变化', { 页码: this.配置.当前页码 })
        if (this.页码变化回调 !== null) {
          await this.页码变化回调(this.配置.当前页码)
        }
      }
    }
    容器.appendChild(下一页按钮)

    this.shadow.innerHTML = ''
    this.shadow.appendChild(容器)
  }

  protected override async 当加载时(): Promise<void> {
    await this.渲染()
  }
}
