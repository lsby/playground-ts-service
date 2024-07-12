import axios from 'axios'
import { 任意接口类型 } from '@lsby/net-core'
import { GlobalEnv } from '../../global/global'
import { 从接口类型获得接口JSON参数 } from './type'

export async function 请求用例01<接口类型 extends 任意接口类型>(
  接口类型描述: 接口类型,
  参数: 从接口类型获得接口JSON参数<接口类型>,
  登录: {
    接口: string
    用户名: string
    密码: string
    凭据属性: string
  },
): Promise<object> {
  var env = await GlobalEnv.getInstance()

  var login = await axios.post(`http://127.0.0.1:${env.APP_PORT}${登录.接口}`, {
    name: 登录.用户名,
    pwd: 登录.密码,
  })
  var token = login.data[登录.凭据属性]

  var method = 接口类型描述.获得方法()
  var urlPath = 接口类型描述.获得路径()
  var url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

  if (method == 'get') return (await axios.get(url, { ...参数, headers: { authorization: token } })).data
  if (method == 'post') return (await axios.post(url, 参数, { headers: { authorization: token } })).data

  throw new Error('意外的请求模式')
}
