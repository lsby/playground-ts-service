import { 组件基类 } from '../../base/base.js'
import { globalWebLog } from '../../global/manager/log-manager.js'

type 发出事件类型 = {}
type 监听事件类型 = {}

type 调试配置 = { 排除事件?: string }

export class 设置调试组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-set-debug', this)
  }

  private 配置: 调试配置

  public constructor(配置: 调试配置 = {}) {
    super()
    this.配置 = 配置
  }

  protected override async 当加载时(): Promise<void> {
    console.log('当前环境: %o', process.env['NODE_ENV'])

    if (process.env['NODE_ENV'] !== 'development') {
      // 生产模式
      localStorage['debug'] = ''
    } else {
      localStorage['debug'] = '*'

      let 排除事件: string[] = []
      if (this.配置.排除事件 !== undefined) {
        排除事件 = this.配置.排除事件.split(',')
      }

      // 劫持 addEventListener
      let originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = async function (type, listener, options): Promise<void> {
        if (排除事件.includes(type)) {
          return originalAddEventListener.call(this, type, listener, options)
        }

        let 组件日志 = globalWebLog.extend(this.constructor.name)
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
        } else if (typeof listener === 'object' && listener !== null && typeof listener.handleEvent === 'function') {
          originalAddEventListener.call(
            this,
            type,
            async (event) => {
              await 组件日志.debug('事件触发: %o <= %O, %O', type, listener, options)
              return listener.handleEvent.call(listener, event)
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
