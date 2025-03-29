import { GlobalWeb } from '../global/global'

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
