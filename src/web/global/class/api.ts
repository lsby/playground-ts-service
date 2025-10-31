import { 不安全的扩展WebRequest, 不安全的扩展WebRequest表单 } from '@lsby/ts-http-extend'
import { InterfaceType } from '../../../types/interface-type'
import { API前缀 } from '../api-prefix'
import { 错误提示 } from '../toast'
import { 不安全的通过路径获得接口定义, 获得对象属性 } from '../types/types'

export class API管理器类 {
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

  public async 请求post接口<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
    | { status: 'unexpected'; data: string }
  > {
    return await this.执行通用接口请求(接口路径, 'POST', 参数, ws信息回调, ws连接回调, ws关闭回调, ws错误回调)
  }
  public async 请求get接口<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
    | { status: 'unexpected'; data: string }
  > {
    return await this.执行通用接口请求(接口路径, 'GET', 参数, ws信息回调, ws连接回调, ws关闭回调, ws错误回调)
  }

  public async 请求post接口并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    return await this.执行接口请求并处理错误(
      接口路径,
      async () => await this.请求post接口(接口路径, 参数, ws信息回调, ws连接回调, ws关闭回调, ws错误回调),
    )
  }
  public async 请求get接口并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    参数: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'>,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    return await this.执行接口请求并处理错误(
      接口路径,
      async () => await this.请求get接口(接口路径, 参数, ws信息回调, ws连接回调, ws关闭回调, ws错误回调),
    )
  }

  public async 请求post表单接口<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    表单数据: FormData,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
    | { status: 'unexpected'; data: string }
  > {
    return await this.执行通用接口请求(接口路径, 'POST', 表单数据, ws信息回调, ws连接回调, ws关闭回调, ws错误回调)
  }
  public async 请求get表单接口<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    表单数据: FormData,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
    | { status: 'unexpected'; data: string }
  > {
    return await this.执行通用接口请求(接口路径, 'GET', 表单数据, ws信息回调, ws连接回调, ws关闭回调, ws错误回调)
  }

  public async 请求post表单接口并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    表单数据: FormData,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    return await this.执行接口请求并处理错误(
      接口路径,
      async () => await this.请求post表单接口(接口路径, 表单数据, ws信息回调, ws连接回调, ws关闭回调, ws错误回调),
    )
  }
  public async 请求get表单接口并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    表单数据: FormData,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    return await this.执行接口请求并处理错误(
      接口路径,
      async () => await this.请求get表单接口(接口路径, 表单数据, ws信息回调, ws连接回调, ws关闭回调, ws错误回调),
    )
  }

  private async 执行通用接口请求<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    方法: 'POST' | 'GET',
    数据: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'input'> | FormData,
    ws信息回调?: (
      data: 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'webSocketData'>,
    ) => Promise<void>,
    ws连接回调?: (ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
    | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
    | { status: 'unexpected'; data: string }
  > {
    try {
      let 头: { [key: string]: string } = {}
      if (this.token !== null) {
        头['authorization'] = this.token
      }
      let ws回调选项: Record<string, any> = {
        ...(ws信息回调 !== void 0 ? { ws信息回调: ws信息回调 } : {}),
        ...(ws关闭回调 !== void 0 ? { ws关闭回调: ws关闭回调 } : {}),
        ...(ws错误回调 !== void 0 ? { ws错误回调: ws错误回调 } : {}),
        ...(ws连接回调 !== void 0 ? { ws连接回调: ws连接回调 } : {}),
      }

      if (数据 instanceof FormData) {
        return await 不安全的扩展WebRequest表单({
          url: API前缀 + 接口路径,
          method: 方法,
          表单数据: 数据,
          头: 头,
          ...ws回调选项,
        })
      } else {
        return await 不安全的扩展WebRequest({
          url: API前缀 + 接口路径,
          method: 方法,
          参数: 数据,
          头: 头,
          ...ws回调选项,
        })
      }
    } catch (e) {
      return { status: 'unexpected', data: String(e) }
    }
  }
  private async 执行接口请求并处理错误<接口路径 extends InterfaceType[number]['path']>(
    接口路径: 接口路径,
    请求函数: () => Promise<
      | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'errorOutput'>
      | 获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>
      | { status: 'unexpected'; data: string }
    >,
  ): Promise<
    获得对象属性<获得对象属性<不安全的通过路径获得接口定义<接口路径, InterfaceType>, 'successOutput'>, 'data'>
  > {
    let 请求结果 = await 请求函数()
    if (this.是标准返回格式(请求结果) === false) return 请求结果

    if (请求结果.status === 'fail' || 请求结果.status === 'unexpected') {
      let 提示 = `请求接口失败: ${接口路径}: ${请求结果.data}`
      await 错误提示(提示)
      throw new Error(提示)
    }
    return 请求结果.data as any
  }

  private 是标准返回格式(
    x: any,
  ): x is
    | { status: 'fail'; data: string }
    | { status: 'success'; data: Record<string, any> }
    | { status: 'unexpected'; data: string } {
    return typeof x === 'object' && x !== null && 'status' in x && 'data' in x
  }
}
