import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import axios, { AxiosResponse } from 'axios'
import * as nanoid from 'nanoid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import {
  Get请求后端函数类型,
  Post_API接口路径们,
  Post请求后端函数类型,
  从路径获得API接口一般属性,
  元组转联合,
} from './types'

export class 后端客户端 {
  private token: string | null = null

  post: Post请求后端函数类型 = (路径, 参数, ws信息回调, ws关闭回调, ws错误回调, 获得ws句柄) => {
    return (async (): Promise<any> => {
      let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('post')

      let 扩展头: { [key: string]: string } = {}
      if (typeof ws信息回调 !== 'undefined') {
        let wsId = nanoid.nanoid()
        let 设置ws连接 = async (wsId: string): Promise<void> => {
          await log.info(`正在建立 WebSocket 连接: ${wsId}`)
          let ws连接 = new WebSocket(`/ws?id=${wsId}`)
          获得ws句柄?.(ws连接)

          await new Promise((res, _rej) => {
            ws连接.onopen = async (): Promise<void> => {
              await log.info(`WebSocket 连接已打开: ${wsId}`)
              res(null)
            }
          })
          ws连接.onmessage = async (event: MessageEvent): Promise<void> => {
            await log.debug(`收到 WebSocket 消息: ${event.data}`)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let data = JSON.parse(event.data)
            ws信息回调(data)
          }
          ws连接.onclose = async (event): Promise<void> => {
            ws关闭回调?.(event)
            if (event.code === 1000) {
              await log.info(`WebSocket 连接正常关闭: ${wsId}`)
              return
            }
            let 退避时间 = 100
            await log.warn(`WebSocket 连接异常关闭 (code: ${event.code}), 将在 ${退避时间} 毫秒后尝试重连: ${wsId}`)
            await new Promise<void>((res, _rej) => setTimeout(() => res(), 退避时间))
            await 设置ws连接(wsId)
          }
          ws连接.onerror = async (error): Promise<void> => {
            await log.error(`WebSocket 发生错误: ${wsId}`, error)
            ws错误回调?.(error)
          }
        }
        await 设置ws连接(wsId)

        扩展头 = { 'ws-client-id': wsId }
      }

      let 结果: AxiosResponse<any, any>
      try {
        await log.info(`请求:%o:%o`, 路径, 参数)
        结果 = await axios.post(路径, 参数, { headers: Object.assign({ authorization: this.token }, 扩展头) })
        await log.info(`结果:%o:%o`, 路径, 结果)
      } catch (e) {
        await log.error(`错误:%o:%o`, 路径, e)
        alert(`发生了错误`)
        throw e
      }

      if (结果.data.status === 'fail') {
        await log.error(`错误:%o:%o`, 路径, 结果.data)
        alert(`错误: ${JSON.stringify(结果.data)}`)
        throw new Error(结果.data)
      }

      return 结果.data.data
    })() as any
  }
  get: Get请求后端函数类型 = async (路径, 参数) => {
    let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('get')

    let 结果: AxiosResponse<any, any>
    try {
      await log.info(`请求:%o:%o`, 路径, 参数)
      结果 = await axios.get(路径, { ...参数, headers: { authorization: this.token } })
      await log.info(`结果:%o:%o`, 路径, 结果)
    } catch (e) {
      await log.error(`错误:%o:%o`, 路径, e)
      alert(`发生了错误`)
      throw e
    }

    if (结果.data.status === 'fail') {
      await log.error(`错误:%o:%o`, 路径, 结果.data)
      alert(`错误: ${JSON.stringify(结果.data)}`)
      throw new Error(结果.data)
    }

    return 结果.data.data
  }

  async 初始化(): Promise<this> {
    let storedToken = localStorage.getItem('token')
    if (storedToken !== null) {
      this.token = storedToken
    }
    let c = await this.post('/api/user/is-login', {})
    if (c.isLogin === false) {
      localStorage.removeItem('token')
      this.token = null
    }
    return this
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async 登录(用户名: string, 密码: string) {
    let c = await this.post('/api/user/login', { name: 用户名, pwd: 密码 })
    this.token = c.token
    localStorage.setItem('token', this.token)
    return c
  }
  async 退出登录(): Promise<void> {
    localStorage.removeItem('token')
    this.token = null
  }

  已登录(): boolean {
    return this.token !== null
  }
}

export let GlobalWeb = new GlobalService([
  new GlobalItem('后端客户端', new 后端客户端()),
  new GlobalItem('log', new Log('web')),
])

export function usePost<
  路径 extends 元组转联合<Post_API接口路径们>,
  数据类型 extends 从路径获得API接口一般属性<路径>['successOutput']['data'],
>(
  路径: 路径,
  参数: 从路径获得API接口一般属性<路径>['input'],
): [SyncState<数据类型 | null>, (新值: 数据类型) => void, () => Promise<void>] {
  let [返回数据, 设置数据] = useSyncState<数据类型 | null>(null)
  let 参数文本 = useMemo(() => JSON.stringify(参数), [参数])

  let 请求数据 = useCallback(async (): Promise<void> => {
    let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('usePost')
    let 客户端 = await GlobalWeb.getItem('后端客户端')

    await log.info(`请求:%o:%o`, 路径, JSON.parse(参数文本))
    let 结果 = await 客户端.post(路径, JSON.parse(参数文本))
    await log.info(`结果:%o:%o`, 路径, 结果)

    设置数据(结果 as 数据类型)
  }, [参数文本, 设置数据, 路径])

  let 强制刷新 = useCallback(async (): Promise<void> => {
    await 请求数据()
  }, [请求数据])

  useEffect(() => {
    请求数据().catch((e) => {
      GlobalWeb.getItem('log')
        .then((log) => log.error(e))
        .catch(console.error)
    })

    return (): void => {}
  }, [请求数据])

  return [返回数据, 设置数据, 强制刷新]
}

type 计算get参数类型<Arr> = Arr extends []
  ? {}
  : Arr extends [infer x, ...infer xs]
    ? x extends string
      ? Record<x, string> & 计算get参数类型<xs>
      : never
    : never
export function useQueryParams<参数描述 extends string[]>(参数描述: [...参数描述]): 计算get参数类型<参数描述> | null {
  let [params, setParams] = useState<计算get参数类型<参数描述> | null>(null)
  let 参数描述文本 = JSON.stringify(参数描述)

  useEffect(() => {
    let queryParams = new URLSearchParams(window.location.search)

    let queryObject: Record<string, string> = {}
    queryParams.forEach((value, key) => {
      queryObject[key] = value
    })

    let result = z
      .object(
        (JSON.parse(参数描述文本) as string[])
          .map((a) => ({ [a]: z.string() }))
          .reduce((s, a) => Object.assign(s, a), {}),
      )
      .safeParse(queryObject)

    if (result.success) {
      setParams(result.data as any)
    } else {
      ;(async (): Promise<void> => {
        let log = await GlobalWeb.getItem('log')
        await log.error('获得get参数失败: %O', result.error)
      })().catch(console.error)
      setParams(null)
    }
  }, [参数描述文本])

  return params
}

export type SyncState<A> = {
  value: A
}
export function useSyncState<A>(状态值: A): [SyncState<A>, (新数据: A) => void] {
  let [数据, 设置数据] = useState(状态值)
  let 数据Ref = useRef(状态值)

  useEffect(() => {
    数据Ref.current = 数据
  }, [数据])

  let 更新数据 = useCallback((新数据: A) => {
    数据Ref.current = 新数据
    设置数据(新数据)
  }, [])

  return [
    {
      get value(): A {
        return 数据Ref.current
      },
    },
    更新数据,
  ]
}
