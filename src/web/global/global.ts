import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import * as uuid from 'uuid'
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
      let 扩展头: { [key: string]: string } = {}
      if (typeof ws信息回调 !== 'undefined') {
        let wsId = uuid.v1()
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

      try {
        let c = await axios.post(路径, 参数, { headers: Object.assign({ authorization: this.token }, 扩展头) })
        return c.data
      } catch (e) {
        let log = new Log('web')
        await log.err('服务器错误: %o', e)
        alert(`服务器错误: ${e}`)
        throw new Error('服务器错误')
      }
    })() as any
  }
  get: Get请求后端函数类型 = async (路径, 参数) => {
    try {
      let c = await axios.get(路径, { ...参数, headers: { authorization: this.token } })
      return c.data
    } catch (e) {
      let log = new Log('web')
      await log.err('服务器错误: %o', e)
      alert(`服务器错误: ${e}`)
      throw new Error('服务器错误')
    }
  }

  async 初始化(): Promise<this> {
    let storedToken = localStorage.getItem('token')
    if (storedToken !== null) {
      this.token = storedToken
    }
    let c = await this.post('/api/user/is-login', {})
    if (c.data.isLogin === false) {
      localStorage.removeItem('token')
      this.token = null
    }
    return this
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async 登录(用户名: string, 密码: string) {
    let c = await this.post('/api/user/login', { name: 用户名, pwd: 密码 })
    if (c.status !== 'fail') {
      this.token = c.data.token
      localStorage.setItem('token', this.token)
    }
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
  构造参数: 从路径获得表接口构造参数<路径>,
  筛选条件?: 从路径获得表接口属性<路径>['查参数_筛选条件'] | undefined,
  分页条件?: 从路径获得表接口属性<路径>['查参数_分页条件'] | undefined,
  排序条件?: 从路径获得表接口属性<路径>['查参数_排序条件'] | undefined,
): [
  从路径获得表接口属性<路径>['查原始正确值'] | null,
  (数据们: 从路径获得表接口属性<路径>['增参数_数据们']) => void,
  (筛选条件: 从路径获得表接口属性<路径>['删参数_筛选条件']) => void,
  (新值: 从路径获得表接口属性<路径>['改参数_新值'], 筛选条件: 从路径获得表接口属性<路径>['改参数_筛选条件']) => void,
  () => void,
] {
  let [数据, 设置数据] = useState<从路径获得表接口属性<路径>['查原始正确值'] | null>(null)
  let [刷新标志, 设置刷新标志] = useState(false)
  let 构造参数文本 = JSON.stringify(构造参数)
  let 筛选条件文本: string | undefined = JSON.stringify(筛选条件)
  let 分页条件文本: string | undefined = JSON.stringify(分页条件)
  let 排序条件文本: string | undefined = JSON.stringify(排序条件)

  useEffect(() => {
    if (刷新标志) {
      设置刷新标志(false)
    }

    let 已请求 = false

    let 请求数据 = async (): Promise<void> => {
      if (已请求) return

      let log = await GlobalWeb.getItem('log')
      let 客户端 = await GlobalWeb.getItem('后端客户端')
      let 请求路径 = 资源路径 + '/get'

      let 验证筛选条件文本 = (筛选条件文本 as string | undefined) ?? null
      let 验证分页条件文本 = (分页条件文本 as string | undefined) ?? null
      let 验证排序条件文本 = (排序条件文本 as string | undefined) ?? null

      let 结果 = await 客户端.post(
        请求路径 as any,
        {
          construction: JSON.parse(构造参数文本) as unknown,
          where: 验证筛选条件文本 !== null ? (JSON.parse(筛选条件文本) as unknown) : void 0,
          page: 验证分页条件文本 !== null ? (JSON.parse(分页条件文本) as unknown) : void 0,
          sort: 验证排序条件文本 !== null ? (JSON.parse(排序条件文本) as unknown) : void 0,
        } as any,
      )
      if (结果.status === 'fail') {
        await log.err('请求 %o 发生错误: %o', 请求路径, 结果.data)
        return
      }

      设置数据(结果.data as any)
    }

    请求数据().catch((e) => {
      GlobalWeb.getItem('log')
        .then((log) => log.err(e))
        .catch(console.error)
    })

    return (): void => {
      已请求 = true
    }
  }, [资源路径, 构造参数文本, 筛选条件文本, 分页条件文本, 排序条件文本, 刷新标志])

  let 增 = useCallback(
    async (数据们: 从路径获得表接口属性<路径>['增参数_数据们']) => {
      let 请求路径 = `${资源路径}/add`
      await 增删改请求({
        url: 请求路径,
        body: { construction: JSON.parse(构造参数文本) as unknown, value: 数据们 },
      })
    },
    [资源路径, 构造参数文本],
  )
  let 删 = useCallback(
    async (筛选条件: 从路径获得表接口属性<路径>['删参数_筛选条件']) => {
      let 请求路径 = `${资源路径}/del`
      await 增删改请求({
        url: 请求路径,
        body: { construction: JSON.parse(构造参数文本) as unknown, where: 筛选条件 },
      })
    },
    [资源路径, 构造参数文本],
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
    [资源路径, 构造参数文本],
  )
  let 强制刷新 = useCallback((): void => {
    设置刷新标志(true)
  }, [设置刷新标志])

  return [数据, 增, 删, 改, 强制刷新]

  async function 增删改请求({ url, body }: { url: string; body: any }): Promise<void> {
    let log = await GlobalWeb.getItem('log')
    let 客户端 = await GlobalWeb.getItem('后端客户端')
    try {
      let response = await 客户端.post(url as any, body)
      if (response.status === 'fail') {
        await log.err('请求 %o 发生错误: %o', url, response.data)
        return
      }
      设置刷新标志(true)
    } catch (error) {
      await log.err('请求 %o 异常: %o', url, error)
      throw error
    }
  }
}

export function usePost<
  路径 extends 元组转联合<Post_API接口路径们>,
  数据类型 extends 从路径获得API接口一般属性<路径>['successOutput']['data'],
>(路径: 路径, 参数: 从路径获得API接口一般属性<路径>['input']): [数据类型 | null, (新值: 数据类型) => void, () => void] {
  let [返回数据, 设置数据] = useState<数据类型 | null>(null)
  let [刷新标志, 设置刷新标志] = useState(false)
  let 参数文本 = JSON.stringify(参数)

  useEffect(() => {
    if (刷新标志) {
      设置刷新标志(false)
    }

    let 已请求 = false

    let 请求数据 = async (): Promise<void> => {
      if (已请求) return

      let log = await GlobalWeb.getItem('log')
      let 客户端 = await GlobalWeb.getItem('后端客户端')

      let 结果 = await 客户端.post(路径, JSON.parse(参数文本))
      if (结果.status === 'fail') {
        await log.err('请求 %o 发生错误: %o', 路径, 结果.data)
        return
      }

      设置数据(结果.data as any)
    }

    请求数据().catch((e) => {
      GlobalWeb.getItem('log')
        .then((log) => log.err(e))
        .catch(console.error)
    })

    return (): void => {
      已请求 = true
    }
  }, [路径, 参数文本, 刷新标志])

  let 强制刷新 = useCallback((): void => {
    设置刷新标志(true)
  }, [设置刷新标志])

  return [返回数据, 设置数据, 强制刷新]
}
