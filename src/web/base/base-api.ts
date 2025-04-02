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
  protected async 请求接口<接口名称 extends keyof 接口定义>(
    接口名称: 接口名称,
    参数: 接口定义[接口名称]['input'],
    头?: object,
    ws信息回调?: (data: 接口定义[接口名称]['webSocketData']) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<接口定义[接口名称]['errorOutput'] | 接口定义[接口名称]['successOutput']> {
    return 不安全的扩展WebPost(this.获得属性(接口名称.toString()), 参数, 头, ws信息回调, ws关闭回调, ws错误回调)
  }
}
