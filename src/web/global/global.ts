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
  从路径获得表接口属性,
  从路径获得表接口构造参数,
  元组转联合,
  所有表接口路径们,
} from './types'

export class 后端客户端 {
  private token: string | null = null

  post: Post请求后端函数类型 = (路径, 参数, ws信息回调, ws关闭回调, ws错误回调) => {
    return (async (): Promise<any> => {
      let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('post')

      let 扩展头: { [key: string]: string } = {}
      if (typeof ws信息回调 !== 'undefined') {
        let wsId = nanoid.nanoid()
        let ws连接 = new WebSocket(`/ws?id=${wsId}`)

        await new Promise((res, _rej) => {
          ws连接.onopen = (): void => {
            res(null)
          }
        })
        ws连接.onmessage = (event: MessageEvent): void => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          let data = JSON.parse(event.data)
          ws信息回调(data)
        }
        ws连接.onclose = (event): void => {
          ws关闭回调?.(event)
        }
        ws连接.onerror = (error): void => {
          ws错误回调?.(error)
        }
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

export function useTable<路径 extends 元组转联合<所有表接口路径们>>(
  资源路径: 路径,
  构造参数: 从路径获得表接口构造参数<路径> | null,
  筛选条件?: 从路径获得表接口属性<路径>['查参数_筛选条件'] | undefined,
  分页条件?: 从路径获得表接口属性<路径>['查参数_分页条件'] | undefined,
  排序条件?: 从路径获得表接口属性<路径>['查参数_排序条件'] | undefined,
): [
  数据: SyncState<从路径获得表接口属性<路径>['查原始正确值'] | null>,
  {
    增: (数据们: 从路径获得表接口属性<路径>['增参数_数据们']) => Promise<void>
    删: (筛选条件: 从路径获得表接口属性<路径>['删参数_筛选条件']) => Promise<void>
    改: (
      新值: 从路径获得表接口属性<路径>['改参数_新值'],
      筛选条件: 从路径获得表接口属性<路径>['改参数_筛选条件'],
    ) => Promise<void>
    强制刷新: () => Promise<void>
    仅修改: (新值: 从路径获得表接口属性<路径>['查原始正确值'] | null) => void
  },
] {
  let [数据, 设置数据] = useSyncState<从路径获得表接口属性<路径>['查原始正确值'] | null>(null)
  let 构造参数文本 = useMemo(() => JSON.stringify(构造参数), [构造参数])
  let 筛选条件文本 = useMemo(() => JSON.stringify(筛选条件), [筛选条件])
  let 分页条件文本 = useMemo(() => JSON.stringify(分页条件), [分页条件])
  let 排序条件文本 = useMemo(() => JSON.stringify(排序条件), [排序条件])

  let 请求数据 = useCallback(async (): Promise<void> => {
    if (构造参数文本 === 'null') return

    let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('useTable')
    let 客户端 = await GlobalWeb.getItem('后端客户端')
    let 请求路径 = 资源路径 + '/get'

    let 验证筛选条件文本 = (筛选条件文本 as string | undefined) ?? null
    let 验证分页条件文本 = (分页条件文本 as string | undefined) ?? null
    let 验证排序条件文本 = (排序条件文本 as string | undefined) ?? null

    let 请求参数 = {
      construction: JSON.parse(构造参数文本) as unknown,
      where: 验证筛选条件文本 !== null ? (JSON.parse(筛选条件文本) as unknown) : void 0,
      page: 验证分页条件文本 !== null ? (JSON.parse(分页条件文本) as unknown) : void 0,
      sort: 验证排序条件文本 !== null ? (JSON.parse(排序条件文本) as unknown) : void 0,
    }

    await log.info(`请求:%o:%o`, 请求路径, 请求参数)
    let 结果 = await 客户端.post(请求路径 as any, 请求参数 as any)
    await log.info(`结果:%o:%o`, 请求路径, 结果)

    设置数据(结果 as any)
  }, [分页条件文本, 排序条件文本, 构造参数文本, 筛选条件文本, 设置数据, 资源路径])

  let 增删改请求 = useCallback(
    async ({ url, body }: { url: string; body: any }): Promise<void> => {
      let log = (await GlobalWeb.getItem('log')).extend(nanoid.nanoid()).extend('useTable')
      let 客户端 = await GlobalWeb.getItem('后端客户端')
      try {
        await log.info(`请求:%o:%o`, url, body)
        let response = await 客户端.post(url as any, body)
        await log.info(`结果:%o:%o`, url, response)

        await 请求数据()
      } catch (error) {
        await log.error('请求 %o 异常: %o', url, error)
        throw error
      }
    },
    [请求数据],
  )

  let 增 = useCallback(
    async (数据们: 从路径获得表接口属性<路径>['增参数_数据们']) => {
      let 请求路径 = `${资源路径}/add`
      await 增删改请求({
        url: 请求路径,
        body: { construction: JSON.parse(构造参数文本) as unknown, value: 数据们 },
      })
    },
    [资源路径, 构造参数文本, 增删改请求],
  )
  let 删 = useCallback(
    async (筛选条件: 从路径获得表接口属性<路径>['删参数_筛选条件']) => {
      let 请求路径 = `${资源路径}/del`
      await 增删改请求({
        url: 请求路径,
        body: { construction: JSON.parse(构造参数文本) as unknown, where: 筛选条件 },
      })
    },
    [资源路径, 构造参数文本, 增删改请求],
  )
  let 改 = useCallback(
    async (
      新值: 从路径获得表接口属性<路径>['改参数_新值'],
      筛选条件: 从路径获得表接口属性<路径>['改参数_筛选条件'],
    ) => {
      let 请求路径 = `${资源路径}/set`
      await 增删改请求({
        url: 请求路径,
        body: { construction: JSON.parse(构造参数文本) as unknown, value: 新值, where: 筛选条件 },
      })
    },
    [资源路径, 构造参数文本, 增删改请求],
  )
  let 强制刷新 = useCallback(async (): Promise<void> => {
    await 请求数据()
  }, [请求数据])

  let 表操作 = useMemo(() => {
    return { 增, 删, 改, 强制刷新, 仅修改: 设置数据 }
  }, [删, 增, 强制刷新, 改, 设置数据])

  useEffect(() => {
    请求数据().catch((e) => {
      GlobalWeb.getItem('log')
        .then((log) => log.error(e))
        .catch(console.error)
    })
    return (): void => {}
  }, [请求数据])

  return [数据, 表操作]
}

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
