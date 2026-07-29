let 抛出错误 = (名称: string): never => {
  throw new Error(
    `[纯前端模式错误] 你在一个支持纯前端的接口中，调用了不支持的模块依赖 (尝试执行: ${名称})。请检查并移除该依赖，或在 package.json 的 alias 中为其提供专门的 mock。`,
  )
}

let 创建递归代理 = (名称: string): unknown => {
  // 使用 function 这样它既可以被 new，也可以被 call，也可以访问 prototype
  let 代理目标函数 = function (): void {}
  return new Proxy(代理目标函数, {
    get(目标: unknown, 属性: string | symbol): unknown {
      if (属性 === '__esModule') return true
      if (属性 === 'then') return undefined
      if (属性 === 'prototype') return 代理目标函数.prototype
      if (属性 === 'name') return 名称.split('.').pop()
      if (属性 === 'toString' || 属性 === 'valueOf') return (): string => `[Mock ${名称}]`
      if (属性 === 'constructor') return 代理目标函数
      if (typeof 属性 === 'symbol') return undefined
      return 创建递归代理(`${名称}.${String(属性)}`)
    },
    apply(): never {
      return 抛出错误(`${名称}()`)
    },
    construct(): never {
      return 抛出错误(`new ${名称}()`)
    },
  })
}

// 导出所有常见的被 Parcel 静态检查刁难的具名导出
export let Buffer: unknown = 创建递归代理('Buffer')
export let WebSocket: unknown = 创建递归代理('WebSocket')
export let WebSocketServer: unknown = 创建递归代理('WebSocketServer')
export let Readable: unknown = 创建递归代理('Readable')
export let Writable: unknown = 创建递归代理('Writable')
export let Duplex: unknown = 创建递归代理('Duplex')
export let Transform: unknown = 创建递归代理('Transform')
export let pipeline: unknown = 创建递归代理('pipeline')
export let networkInterfaces: unknown = 创建递归代理('networkInterfaces')
export let EventEmitter: unknown = 创建递归代理('EventEmitter')

export default 创建递归代理('default')
