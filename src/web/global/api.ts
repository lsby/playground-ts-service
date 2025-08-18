import { 不安全的扩展WebPost } from '@lsby/ts-post-extend'
import { InterfaceType } from '../../types/interface-type'
import { 不安全的通过路径获得接口定义, 获得对象属性 } from '../global/types'

export class API管理器 {
  private 本地存储名称 = 'lsby-api-component-base-token'
  private token: string | null = null

  public constructor() {
    let storedToken = localStorage.getItem(this.本地存储名称)
    if (storedToken !== null) {
      this.token = storedToken
    }
  }

  public 设置token(token: string): void {
    this.token = token
    localStorage.setItem(this.本地存储名称, token)
  }

  public 清除token(): void {
    this.token = null
    localStorage.removeItem(this.本地存储名称)
  }

  public async 请求接口<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
  > {
    try {
      return await 不安全的扩展WebPost(
        接口路径,
        参数,
        { authorization: this.token },
        ws信息回调,
        ws关闭回调,
        ws错误回调,
      )
    } catch (e) {
      return { status: 'fail', data: String(e) } as any
    }
  }

  public async 请求接口并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    let 请求结果 = await this.请求接口(接口路径, 参数, ws信息回调, ws关闭回调, ws错误回调)
    if (this.是标准返回格式(请求结果) === false) return 请求结果

    if (请求结果.status === 'fail') {
      let 提示 = `请求接口失败: ${接口路径}: ${请求结果.data}`
      alert(提示)
      throw new Error(提示)
    }
    return 请求结果.data as any
  }
  private 是标准返回格式(
    x: any,
  ): x is { status: 'fail'; data: string } | { status: 'success'; data: Record<string, any> } {
    return typeof x === 'object' && x !== null && 'status' in x && 'data' in x
  }
}
