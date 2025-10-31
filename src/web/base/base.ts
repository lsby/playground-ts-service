import { log } from '../global/log'

export abstract class 组件基类<
  属性类型 extends Record<string, string>,
  发出事件类型 extends Record<string, any>,
  监听事件类型 extends Record<string, any>,
> extends HTMLElement {
  protected static 观察的属性: string[] = []
  public static get observedAttributes(): string[] {
    return this.观察的属性
  }

  public static 注册组件(组件名称: string, 组件: CustomElementConstructor): void {
    if (customElements.get(组件名称) === void 0) customElements.define(组件名称, 组件)
    else console.warn(`组件名称 ${组件名称} 重复`)
  }

  protected log = log.extend(this.constructor.name)
  protected shadow = this.attachShadow({ mode: 'open' })

  private 初始化完毕 = false
  private 初始化完成事件: Promise<void> | null = null
  private 初始化完成解析器: (() => void) | null = null
  private 变化队列: { name: keyof 属性类型; oldValue: string; newValue: string }[] = []

  public constructor(属性?: 属性类型 | undefined) {
    super()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (属性 === void 0) return
    Object.entries(属性).forEach(([k, v]) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (v !== void 0) this.setAttribute(k, v)
    })
  }

  public async 设置属性<K extends keyof 属性类型>(k: K, v: 属性类型[K]): Promise<void> {
    await this.log.debug('设置属性: %o = %o, 对象: %O', k, v, this)
    this.setAttribute(k.toString(), v)
  }
  public async 获得属性<K extends keyof 属性类型>(k: K): Promise<属性类型[K] | null> {
    let r = this.getAttribute(k.toString())
    await this.log.debug('获得属性: %o = %o, 对象: %O', k, r, this)
    return r as any
  }

  public 获得宿主样式(): CSSStyleDeclaration {
    let style = (this.shadow.host as any).style as CSSStyleDeclaration
    return style
  }

  public 清空dom(): void {
    while (this.firstChild !== null) {
      this.removeChild(this.firstChild)
    }
  }
  public 清空影子dom(): void {
    while (this.shadow.firstChild !== null) {
      this.shadow.removeChild(this.shadow.firstChild)
    }
  }

  public async 刷新(): Promise<void> {
    this.清空影子dom()
    await this.当加载时()
  }

  /**
   * 注意, 只有在dom挂载后初始化才会完成.
   */
  public 等待初始化(): Promise<void> {
    if (this.初始化完毕) return Promise.resolve()
    if (this.初始化完成事件 === null) {
      this.初始化完成事件 = new Promise<void>((res) => {
        this.初始化完成解析器 = res
      })
    }
    return this.初始化完成事件
  }

  public 派发事件<K extends keyof 发出事件类型>(
    k: K,
    v: 发出事件类型[K],
    o?: Omit<CustomEventInit<发出事件类型[K]>, 'detail'>,
  ): boolean {
    return this.dispatchEvent(
      new CustomEvent(k.toString(), {
        detail: v, // 附加数据
        bubbles: true, // 是否冒泡
        cancelable: true, // 是否可取消
        composed: true, // 是否可以穿越影子dom
        ...o,
      }),
    )
  }
  public 监听事件<K extends keyof 监听事件类型>(
    k: K,
    f: (e: CustomEvent<监听事件类型[K]>) => Promise<void>,
    o?: AddEventListenerOptions,
  ): void {
    this.addEventListener(k.toString(), f as any, {
      capture: false, // 是否在捕获阶段响应, true: 在捕获阶段响应, false: 在冒泡阶段响应
      once: false, // 是否只触发一次
      passive: false, // 是否阻止默认行为
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-undefined
      signal: undefined as any, // 触发控制器, 可以用 new AbortController 创建
      ...o,
    })
  }

  protected abstract 当加载时(): Promise<void>
  protected 当卸载时?(): Promise<void>
  protected 当转移时?(): Promise<void>
  protected 当变化时?(name: keyof 属性类型, oldValue: string, newValue: string): Promise<void>

  private async connectedCallback(): Promise<void> {
    await this.log.debug('connectedCallback, 对象: %O', this)

    // 备份初始样式
    let 宿主样式 = this.获得宿主样式()
    let 宿主初始样式: { [key: string]: string } = {}
    for (let i = 0; i < 宿主样式.length; i++) {
      let 样式名 = 宿主样式[i]
      if (样式名 === void 0) continue
      宿主初始样式[样式名] = 宿主样式.getPropertyValue(样式名)
    }

    // 清空影子dom, 避免重复挂载, 因为connectedCallback可能会执行多次
    this.清空影子dom()

    // 执行子类的过程
    await this.当加载时()

    // 标记初始化完成
    this.初始化完毕 = true
    this.初始化完成解析器?.()

    // 还原初始样式
    for (let 样式名 in 宿主初始样式) {
      let 初始样式 = 宿主初始样式[样式名]
      if (初始样式 === void 0 || 宿主样式.getPropertyValue(样式名) === 初始样式) continue
      宿主样式.setProperty(样式名, 初始样式)
    }

    // 应用缓存的变化
    while (true) {
      let 变化 = this.变化队列.shift()
      if (变化 === void 0) break
      await this.当变化时?.(变化.name, 变化.oldValue, 变化.newValue)
    }
  }
  private async disconnectedCallback(): Promise<void> {
    if (this.当卸载时 !== void 0) await this.log.debug('disconnectedCallback, 对象: %O', this)
    await this.当卸载时?.()
  }
  private async adoptedCallback(): Promise<void> {
    if (this.当转移时 !== void 0) await this.log.debug('adoptedCallback, 对象: %O', this)
    await this.当转移时?.()
  }
  private async attributeChangedCallback(name: keyof 属性类型, oldValue: string, newValue: string): Promise<void> {
    if (this.当变化时 !== void 0)
      await this.log.debug('attributeChangedCallback: %o: %o => %o, 对象: %O', name, oldValue, newValue, this)
    if (this.初始化完毕 === false) {
      this.变化队列.push({ name: name, oldValue, newValue })
    } else {
      await this.当变化时?.(name, oldValue, newValue)
    }
  }
}
