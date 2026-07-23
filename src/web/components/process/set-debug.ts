import { 组件基类 } from '../../base/base'
import { globalWebLog } from '../../global/manager/log-manager'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 设置调试组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-set-debug', this)
  }

  public constructor(配置?: { 排除事件?: string }) {
    super()
    if (配置?.排除事件 !== undefined) {
      this.setAttribute('排除事件', 配置.排除事件)
    }
  }

  protected override async 当加载时(): Promise<void> {
    console.log('当前环境: %o', process.env['NODE_ENV'])

    if (process.env['NODE_ENV'] !== 'development') {
      // 生产模式
      localStorage['debug'] = ''
    } else {
      localStorage['debug'] = '*'

      let 排除事件属性 = this.getAttribute('排除事件')
      let 排除事件: string[] = 排除事件属性 !== null ? 排除事件属性.split(',') : []

      // 劫持 addEventListener / removeEventListener
      let originalAddEventListener = EventTarget.prototype.addEventListener
      let originalRemoveEventListener = EventTarget.prototype.removeEventListener
      // 保存原始 listener → 包装 listener 的映射，使 removeEventListener 能正确匹配
      let 监听器映射 = new WeakMap<EventListenerOrEventListenerObject, EventListener>()

      EventTarget.prototype.addEventListener = function (type, listener, options): void {
        if (排除事件.includes(type) || listener === null) {
          return originalAddEventListener.call(this, type, listener, options)
        }

        let 组件日志 = globalWebLog.extend(this.constructor.name)
        void 组件日志.debug('监听事件: %o <= %O, %O', type, listener, options)

        if (typeof listener === 'function') {
          let 包装函数: EventListener = (event) => {
            void 组件日志.debug('事件触发: %o <= %O, %O', type, listener, options)
            return (listener as any).call(this, event)
          }
          监听器映射.set(listener, 包装函数)
          originalAddEventListener.call(this, type, 包装函数, options)
        } else if (
          typeof listener === 'object' &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          listener !== null &&
          typeof (listener as any).handleEvent === 'function'
        ) {
          let 包装函数: EventListener = (event) => {
            void 组件日志.debug('事件触发: %o <= %O, %O', type, listener, options)
            return (listener as any).handleEvent.call(listener, event)
          }
          监听器映射.set(listener, 包装函数)
          originalAddEventListener.call(this, type, 包装函数, options)
        }
      }

      EventTarget.prototype.removeEventListener = function (type, listener, options): void {
        if (listener === null) {
          return originalRemoveEventListener.call(this, type, listener, options)
        }
        let 包装函数 = 监听器映射.get(listener)
        if (包装函数 !== undefined) {
          originalRemoveEventListener.call(this, type, 包装函数, options)
          监听器映射.delete(listener)
        } else {
          originalRemoveEventListener.call(this, type, listener, options)
        }
      }

      // 劫持 dispatchEvent
      let originalDispatchEvent = EventTarget.prototype.dispatchEvent
      EventTarget.prototype.dispatchEvent = function (event): boolean {
        if (排除事件.includes(event.type)) {
          return originalDispatchEvent.call(this, event)
        }

        let 组件日志 = globalWebLog.extend(this.constructor.name)
        if (event instanceof CustomEvent) {
          组件日志
            .debug('派发自定义事件: %o => %O, %O', event.type, event.detail, event)
            .catch(
              (a) => `日志输出错误: ${a}: 日志内容: ${'派发自定义事件: ${event.type} => ${event.detail}, ${event}'}`,
            )
        } else {
          组件日志
            .debug('派发事件: %o => %O', event.type, event)
            .catch((a) => `日志输出错误: ${a}: 派发事件: ${event.type} => ${event}}`)
        }
        return originalDispatchEvent.call(this, event)
      }
    }
  }
}
