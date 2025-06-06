import { 任意接口, 合并JSON插件结果, 获得接口逻辑插件类型, 获得接口逻辑类型 } from '@lsby/net-core'
import axios from 'axios'
import { Global } from '../global/global'

export async function 请求用例<接口类型 extends 任意接口>(
  接口类型描述: 接口类型,
  参数: 合并JSON插件结果<获得接口逻辑插件类型<获得接口逻辑类型<接口类型>>>,
  登录?: {
    接口: string
    用户名: string
    密码: string
    凭据属性: string
  },
): Promise<object> {
  let env = await (await Global.getItem('env')).获得环境变量()

  let token: string | null = null
  if (typeof 登录 !== 'undefined') {
    let login = (await axios.post(`http://127.0.0.1:${env.APP_PORT}${登录.接口}`, {
      userName: 登录.用户名,
      userPassword: 登录.密码,
    })) as { data: { data: { [key: string]: string } } }
    token = login.data.data[登录.凭据属性] ?? null
  }

  let method = 接口类型描述.获得方法() as string
  let urlPath = 接口类型描述.获得路径() as string
  let url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

  if (method === 'get') return (await axios.get(url, { ...参数, headers: { authorization: token } })).data
  if (method === 'post') return (await axios.post(url, 参数, { headers: { authorization: token } })).data

  throw new Error('意外的请求模式')
}
