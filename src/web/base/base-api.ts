import { 不安全的扩展WebPost } from '@lsby/ts-post-extend'
import { 组件基类 } from './base'

export abstract class API组件基类<
  接口定义 extends Record<
    string,
    {
      path: string
      method: 'post'
      input: Record<string, any>
      errorOutput: { status: 'fail'; data: string }
      successOutput: { status: 'success'; data: Record<string, any> }
      webSocketData?: Record<string, any>
    }
  >,
  属性类型 extends Record<string, string>,
  发出事件类型 extends Record<string, any>,
  监听事件类型 extends Record<string, any>,
> extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  private 本地存储名称 = 'lsby-api-component-base-token'
  private token: string | null = null

  constructor(属性: 属性类型) {
    super(属性)
    let storedToken = localStorage.getItem(this.本地存储名称)
    if (storedToken !== null) {
      this.token = storedToken
    }
  }

  protected 设置token(token: string): void {
    this.token = token
    localStorage.setItem(this.本地存储名称, token)
  }
  protected 清除token(): void {
    this.token = null
    localStorage.removeItem(this.本地存储名称)
  }

  protected async 请求接口<接口名称 extends keyof 接口定义>(
    接口名称: 接口名称,
    参数: 接口定义[接口名称]['input'],
    ws信息回调?: (data: 接口定义[接口名称]['webSocketData']) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<接口定义[接口名称]['errorOutput'] | 接口定义[接口名称]['successOutput']> {
    return 不安全的扩展WebPost(
      this.获得属性(接口名称.toString()),
      参数,
      { authorization: this.token },
      ws信息回调,
      ws关闭回调,
      ws错误回调,
    )
  }

  protected async 请求接口并处理错误<接口名称 extends keyof 接口定义>(
    接口名称: 接口名称,
    参数: 接口定义[接口名称]['input'],
    ws信息回调?: (data: 接口定义[接口名称]['webSocketData']) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<接口定义[接口名称]['successOutput']['data']> {
    let 请求结果 = await this.请求接口(接口名称, 参数, ws信息回调, ws关闭回调, ws错误回调)
    if (请求结果.status === 'fail') {
      let 提示 = `请求接口失败: ${String(请求结果.data)}`
      alert(提示)
      throw new Error(提示)
    }
    return 请求结果.data
  }
}
