import axios from 'axios'
import { 任意接口类型 } from '@lsby/net-core'
import { Global } from '../../global/global'
import { 从接口类型获得接口JSON参数 } from './type'

export async function 请求用例00<接口类型 extends 任意接口类型>(
  接口类型描述: 接口类型,
  参数: 从接口类型获得接口JSON参数<接口类型>,
): Promise<object> {
  var env = await (await Global.getItem('env')).获得环境变量()

  var method = 接口类型描述.获得方法()
  var urlPath = 接口类型描述.获得路径()
  var url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

  if (method == 'get') return (await axios.get(url, 参数)).data
  if (method == 'post') return (await axios.post(url, 参数)).data

  throw new Error('意外的请求模式')
}
