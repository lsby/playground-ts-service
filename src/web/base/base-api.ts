import { 不安全的扩展WebPost } from '@lsby/ts-post-extend'
import { 获得对象属性, 通过路径获得接口定义 } from '../global/types'
import { 组件基类 } from './base'

type 接口定义项形状 = {
  path: string
  method: 'post'
  input: Record<string, any>
  errorOutput: { status: 'fail'; data: string }
  successOutput: { status: 'success'; data: Record<string, any> }
  webSocketData?: Record<string, any>
}
type 接口定义形状 = 接口定义项形状[]

export abstract class API组件基类<
  接口定义 extends 接口定义形状,
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

  protected async 请求接口<接口路径 extends 接口定义[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'input'>,
    ws信息回调?: (data: 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'webSocketData'>) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'errorOutput'>
    | 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'successOutput'>
  > {
    return 不安全的扩展WebPost(接口路径, 参数, { authorization: this.token }, ws信息回调, ws关闭回调, ws错误回调)
  }

  protected async 请求接口并处理错误<接口路径 extends 接口定义[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'input'>,
    ws信息回调?: (data: 获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'webSocketData'>) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<获得对象属性<获得对象属性<通过路径获得接口定义<接口路径, 接口定义>, 'successOutput'>, 'data'>> {
    let 请求结果 = await this.请求接口(接口路径, 参数, ws信息回调, ws关闭回调, ws错误回调)
    if (请求结果.status === 'fail') {
      let 提示 = `请求接口失败: ${接口路径}: ${请求结果.data}`
      alert(提示)
      throw new Error(提示)
    }
    return 请求结果.data as any
  }
}
