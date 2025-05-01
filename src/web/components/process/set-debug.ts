import { 组件基类 } from '../../base/base'
import { GlobalWeb } from '../../global/global'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbySetDebug extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-set-debug', this)
  }

  constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    console.log('当前环境: %o', process.env['NODE_ENV'])

    if (process.env['NODE_ENV'] !== 'development') {
      // 生产模式
      localStorage['debug'] = ''
    } else {
      localStorage['debug'] = '*'

      // 劫持 addEventListener
      let originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function (type, listener, options): void {
        let log = GlobalWeb.getItemSync('log').extend(this.constructor.name)
        log.debugSync('监听事件: %o <= %O, %O', type, listener, options)

        if (typeof listener === 'function') {
          originalAddEventListener.call(
            this,
            type,
            (event) => {
              log.debugSync('事件触发: %o <= %O, %O', type, listener, options)
              return listener.call(listener, event)
            },
            options,
          )
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (listener?.handleEvent !== null) {
          originalAddEventListener.call(
            this,
            type,
            (event) => {
              log.debugSync('事件触发: %o <= %O, %O', type, listener, options)
              return listener?.handleEvent.call(listener, event)
            },
            options,
          )
        }
      }

      // 劫持 dispatchEvent
      let originalDispatchEvent = EventTarget.prototype.dispatchEvent
      EventTarget.prototype.dispatchEvent = function (event): boolean {
        let log = GlobalWeb.getItemSync('log').extend(this.constructor.name)
        if (event instanceof CustomEvent) {
          log.debugSync('派发自定义事件: %o => %O, %O', event.type, event.detail, event)
        } else {
          log.debugSync('派发事件: %o => %O', event.type, event)
        }
        return originalDispatchEvent.call(this, event)
      }
    }
  }
}
