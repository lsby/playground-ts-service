import { 任意接口, 合并JSON插件结果, 获得接口逻辑插件类型, 获得接口逻辑类型 } from '@lsby/net-core'
import { z } from 'zod'
import { 环境变量 } from '../global/env'

let 登录响应Schema = z.object({ data: z.record(z.string()) })

async function 获取请求信息(
  接口类型描述: 任意接口,
  登录?: { 接口: string; 用户名: string; 密码: string; 凭据属性: string },
): Promise<{ token: string | null; url: string }> {
  let token: string | null = null
  if (typeof 登录 !== 'undefined') {
    let response = await fetch(`http://127.0.0.1:${环境变量.APP_PORT}${登录.接口}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 登录.用户名, userPassword: 登录.密码 }),
    })
    let parseResult = 登录响应Schema.safeParse(await response.json())
    if (parseResult.success === false) {
      throw new Error(`登录响应验证失败: ${parseResult.error.message}`)
    }
    token = parseResult.data.data[登录.凭据属性] ?? null
  }

  let urlPath = 接口类型描述.获得路径() as string
  let url = `http://127.0.0.1:${环境变量.APP_PORT}${urlPath}`

  return { token, url }
}

export async function POST_JSON请求用例<接口类型 extends 任意接口>(
  接口类型描述: 接口类型,
  参数: 合并JSON插件结果<获得接口逻辑插件类型<获得接口逻辑类型<接口类型>>> extends infer 参数
    ? 'json' extends keyof 参数
      ? 参数['json']
      : {}
    : never,
  登录?: { 接口: string; 用户名: string; 密码: string; 凭据属性: string },
): Promise<object> {
  let { token, url } = await 获取请求信息(接口类型描述, 登录)

  let headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token !== null) {
    headers['authorization'] = token
  }
  let response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(参数) })
  return await response.json()
}
export async function GET请求用例<接口类型 extends 任意接口>(
  接口类型描述: 接口类型,
  参数: 合并JSON插件结果<获得接口逻辑插件类型<获得接口逻辑类型<接口类型>>> extends infer 参数
    ? 'query' extends keyof 参数
      ? 参数['query']
      : {}
    : never,
  登录?: { 接口: string; 用户名: string; 密码: string; 凭据属性: string },
): Promise<object> {
  let { token, url } = await 获取请求信息(接口类型描述, 登录)

  let searchParams = new URLSearchParams()
  if (typeof 参数 === 'object') {
    Object.entries(参数).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
  }
  let finalUrl = searchParams.toString() !== '' ? `${url}?${searchParams}` : url
  let headers: Record<string, string> = {}
  if (token !== null) {
    headers['authorization'] = token
  }
  let response = await fetch(finalUrl, { method: 'GET', headers })
  return await response.json()
}
