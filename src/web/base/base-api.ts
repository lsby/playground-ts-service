import { 组件基类 } from './base'

export abstract class API组件基类<
  接口定义 extends Record<
    string,
    {
      path: string
      method: 'get' | 'post'
      input: Record<string, any>
      errorOutput: { status: 'fail'; data: string }
      successOutput: { status: 'success'; data: Record<string, any> }
    }
  >,
  属性类型 extends Record<string, string>,
  发出事件类型 extends Record<string, any>,
  监听事件类型 extends Record<string, any>,
> extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected async 请求接口<接口名称 extends keyof 接口定义>(
    接口名称: 接口名称,
    方法: 接口定义[接口名称]['method'],
    参数: 接口定义[接口名称]['input'],
  ): Promise<接口定义[接口名称]['errorOutput'] | 接口定义[接口名称]['successOutput']> {
    return await fetch(this.获得属性(接口名称.toString()), {
      method: 方法,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(参数),
    }).then((response) => response.json())
  }
}
