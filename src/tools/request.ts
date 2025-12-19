import { 任意接口, 合并JSON插件结果, 获得接口逻辑插件类型, 获得接口逻辑类型 } from '@lsby/net-core'
import axios from 'axios'
import { 环境变量 } from '../global/env'

async function 获取请求信息(
  接口类型描述: 任意接口,
  登录?: { 接口: string; 用户名: string; 密码: string; 凭据属性: string },
): Promise<{ token: string | null; url: string }> {
  let token: string | null = null
  if (typeof 登录 !== 'undefined') {
    let login: { data: { data: { [key: string]: string } } } = await axios.post(
      `http://127.0.0.1:${环境变量.APP_PORT}${登录.接口}`,
      { userName: 登录.用户名, userPassword: 登录.密码 },
    )
    token = login.data.data[登录.凭据属性] ?? null
  }

  let urlPath = 接口类型描述.获得路径() as string
  let url = `http://127.0.0.1:${环境变量.APP_PORT}${urlPath}`

  return { token, url }
}

export async function POST请求用例<接口类型 extends 任意接口>(
  接口类型描述: 接口类型,
  参数: 合并JSON插件结果<获得接口逻辑插件类型<获得接口逻辑类型<接口类型>>> extends infer 参数
    ? 'body' extends keyof 参数
      ? 参数['body']
      : {}
    : never,
  登录?: { 接口: string; 用户名: string; 密码: string; 凭据属性: string },
): Promise<object> {
  let { token, url } = await 获取请求信息(接口类型描述, 登录)

  return (await axios.post(url, 参数, { headers: { authorization: token } })).data
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

  return (await axios.get(url, { ...参数, headers: { authorization: token } })).data
}
