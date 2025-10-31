import { 组件基类 } from '../../base/base.js'
import { log } from '../../global/log.js'

type 属性类型 = {
  排除事件?: string
}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbySetDebug extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []
  static {
    this.注册组件('lsby-set-debug', this)
  }

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    console.log('当前环境: %o', process.env['NODE_ENV'])

    if (process.env['NODE_ENV'] !== 'development') {
      // 生产模式
      localStorage['debug'] = ''
    } else {
      localStorage['debug'] = '*'

      let 排除事件属性 = await this.获得属性('排除事件')
      let 排除事件: string[] = []
      if (排除事件属性 !== null && 排除事件属性 !== void 0) {
        排除事件 = 排除事件属性.split(',')
      }

      // 劫持 addEventListener
      let originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = async function (type, listener, options): Promise<void> {
        if (排除事件.includes(type)) {
          return originalAddEventListener.call(this, type, listener, options)
        }

        let 组件日志 = log.extend(this.constructor.name)
        await 组件日志.debug('监听事件: %o <= %O, %O', type, listener, options)

        if (typeof listener === 'function') {
          originalAddEventListener.call(
            this,
            type,
            async (event) => {
              await 组件日志.debug('事件触发: %o <= %O, %O', type, listener, options)
              return listener.call(listener, event)
            },
            options,
          )
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (listener?.handleEvent !== null) {
          originalAddEventListener.call(
            this,
            type,
            async (event) => {
              await 组件日志.debug('事件触发: %o <= %O, %O', type, listener, options)
              return listener?.handleEvent.call(listener, event)
            },
            options,
          )
        }
      }

      // 劫持 dispatchEvent
      let originalDispatchEvent = EventTarget.prototype.dispatchEvent
      EventTarget.prototype.dispatchEvent = function (event): boolean {
        if (排除事件.includes(event.type)) {
          return originalDispatchEvent.call(this, event)
        }

        let 组件日志 = log.extend(this.constructor.name)
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
