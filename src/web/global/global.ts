import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import axios from 'axios'
import { useEffect, useState } from 'react'
import * as uuid from 'uuid'
import {
  Get请求后端函数类型,
  Post接口路径们,
  Post请求后端函数类型,
  从路径获得参数,
  从路径获得正确返回,
  从路径获得泛化的错误返回,
  元组转联合,
} from '../../types/interface-type'

export class 后端客户端 {
  private token: string | null = null

  post: Post请求后端函数类型 = async (路径, 参数, ws信息回调, ws关闭回调, ws错误回调) => {
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

export function usePost<
  路径 extends 元组转联合<Post接口路径们>,
  正确类型 extends 从路径获得正确返回<路径>,
  错误类型 extends 从路径获得泛化的错误返回<路径>,
>(
  路径: 路径,
  参数: 从路径获得参数<路径>,
  最大重试次数: number = 5,
  重试延时: number = 1000,
): [
  正确类型 | 错误类型 | null,
  () => void,
  (正确结果: 正确类型['data']) => void,
  (错误结果: 错误类型['data']) => void,
] {
  let [返回数据, 设置数据] = useState<正确类型 | 错误类型 | null>(null)
  let [刷新标志, 设置刷新标志] = useState(false)
  let 参数文本 = JSON.stringify(参数)

  useEffect(() => {
    if (刷新标志) {
      设置刷新标志(false)
    }

    let 已请求 = false
    let 当前重试次数 = 0

    let 请求数据 = (): void => {
      GlobalWeb.getItem('后端客户端')
        .then((客户端) => {
          客户端
            .post(路径, JSON.parse(参数文本))
            .then((结果) => {
              if (已请求) return
              设置数据(结果 as 正确类型)
            })
            .catch((e) => {
              if (当前重试次数 < 最大重试次数) {
                setTimeout(() => {
                  当前重试次数++
                  请求数据()
                }, 重试延时)
              } else {
                let 错误: 错误类型 = { status: 'fail', data: String(e) } as 错误类型
                if (已请求) return
                设置数据(错误)
              }
            })
        })
        .catch((e) => {
          GlobalWeb.getItem('log')
            .then((log) => log.err(e))
            .catch(console.error)
        })
    }

    请求数据()

    return (): void => {
      已请求 = true
    }
  }, [路径, 参数文本, 最大重试次数, 重试延时, 设置数据, 刷新标志])

  return [
    返回数据,
    (): void => {
      设置刷新标志(true)
    },
    (正确结果: 正确类型['data']): void => {
      设置数据({ status: 'success', data: 正确结果 } as unknown as 正确类型)
    },
    (错误结果: 错误类型['data']): void => {
      设置数据({ status: 'fail', data: 错误结果 } as 错误类型)
    },
  ]
}
