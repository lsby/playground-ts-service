import { web请求 } from '@lsby/ts-http-extend'
import { 已审阅的any } from '../../../tools/types'
import { InterfaceType } from '../../../types/interface-type'
import { 错误提示 } from '../manager/toast-manager'

type 取接口<P extends string, T extends readonly 已审阅的any[] = InterfaceType> = T extends readonly [
  infer F,
  ...infer Rest,
]
  ? F extends { path: P }
    ? F
    : 取接口<P, Rest>
  : never

type 取json输入<I> = I extends { input: { json: infer 输入 } } ? 输入 : never

type 取http错误输出<I> = I extends { errorOutput: infer 输出 } ? 输出 : never
type 取http正确输出<I> = I extends { successOutput: infer 输出 } ? 输出 : never
type 取http正确输出数据<I> = I extends { successOutput: { data: infer 输出 } } ? 输出 : never

type 取ws输出<I> = I extends { wsOutput: infer 输出 } ? 输出 : never
type 取ws输入<I> = I extends { wsInput: infer 输入 } ? 输入 : never

type 所有POST_JSON路径 = InterfaceType extends readonly (infer Item)[]
  ? Item extends { method: 'post'; path: infer P; input: { json: infer json } }
    ? json extends never
      ? never
      : P
    : never
  : never

let API前缀 = ''

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

  public async 请求postJson<接口路径 extends 所有POST_JSON路径>(
    接口路径: 接口路径,
    参数: 取json输入<取接口<接口路径>>,
    ws输出回调?: (data: 取ws输出<取接口<接口路径>>) => Promise<void>,
    ws连接回调?: (发送消息: (data: 取ws输入<取接口<接口路径>>) => void, ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<
    取http错误输出<取接口<接口路径>> | 取http正确输出<取接口<接口路径>> | { status: 'unexpected'; data: string }
  > {
    return (await this.通用请求(
      接口路径,
      { 'Content-Type': 'application/json' },
      'POST',
      参数,
      ws输出回调,
      ws连接回调,
      ws关闭回调,
      ws错误回调,
    )) as 已审阅的any
  }
  public async 请求postJson并处理错误<接口路径 extends 所有POST_JSON路径>(
    接口路径: 接口路径,
    参数: 取json输入<取接口<接口路径>>,
    ws输出回调?: (data: 取ws输出<取接口<接口路径>>) => Promise<void>,
    ws连接回调?: (发送消息: (data: 取ws输入<取接口<接口路径>>) => void, ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<取http正确输出数据<取接口<接口路径>>> {
    return (await this.通用请求并处理错误(
      接口路径,
      async () =>
        (await this.请求postJson(接口路径, 参数, ws输出回调, ws连接回调, ws关闭回调, ws错误回调)) as 已审阅的any,
    )) as 已审阅的any
  }

  private async 通用请求(
    接口路径: string,
    头: { [key: string]: string },
    方法: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
    数据: 已审阅的any,
    ws输出回调?: (data: 已审阅的any) => Promise<void>,
    ws连接回调?: (发送消息: (data: 已审阅的any) => void, ws: WebSocket) => Promise<void>,
    ws关闭回调?: (e: CloseEvent) => Promise<void>,
    ws错误回调?: (e: Event) => Promise<void>,
  ): Promise<object | { status: 'unexpected'; data: string }> {
    let 请求结果: string | null = null
    try {
      if (this.token !== null) {
        头['authorization'] = 'Bearer ' + this.token
      }
      let ws回调选项: Record<string, 已审阅的any> = {
        ...(ws输出回调 !== void 0 ? { ws信息回调: ws输出回调 } : {}),
        ...(ws关闭回调 !== void 0 ? { ws关闭回调: ws关闭回调 } : {}),
        ...(ws错误回调 !== void 0 ? { ws错误回调: ws错误回调 } : {}),
        ...(ws连接回调 !== void 0
          ? {
              ws连接回调: async (ws: WebSocket): Promise<void> => {
                let 发送消息 = (data: 已审阅的any): void => {
                  ws.send(JSON.stringify(data))
                }
                await ws连接回调(发送消息, ws)
              },
            }
          : {}),
      }

      // console.log('请求:\n路径: %o\n头: %o\n方法: %o\n参数: %o\n结果: %o', 接口路径, 头, 方法, 数据, 请求结果)
      请求结果 = await web请求({
        url: API前缀 + 接口路径,
        body: JSON.stringify(数据),
        headers: 头,
        method: 方法,
        ws路径: '/ws',
        wsId参数键: 'id',
        wsId头键: 'ws-client-id',
        ...ws回调选项,
      })
      return JSON.parse(请求结果)
    } catch (e) {
      console.error('请求错误:\n路径: %o\n头: %o\n方法: %o\n参数: %o\n结果: %o', 接口路径, 头, 方法, 数据, 请求结果)
      return { status: 'unexpected', data: String(e) }
    }
  }
  private async 通用请求并处理错误(
    接口路径: string,
    请求函数: () => Promise<object | { status: 'unexpected'; data: string }>,
  ): Promise<object> {
    let 请求结果 = await 请求函数()
    if (this.是标准返回格式(请求结果) === false) return 请求结果

    if (请求结果.status === 'fail' || 请求结果.status === 'unexpected') {
      let 提示 = `请求接口失败: ${接口路径}: ${请求结果.data}`
      void 错误提示(提示)
      throw new Error(提示)
    }
    return 请求结果.data as 已审阅的any
  }

  private 是标准返回格式(
    x: unknown,
  ): x is
    | { status: 'fail'; data: string }
    | { status: 'success'; data: Record<string, 已审阅的any> }
    | { status: 'unexpected'; data: string } {
    return typeof x === 'object' && x !== null && 'status' in x && 'data' in x
  }
}
