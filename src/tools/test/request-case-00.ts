import axios from 'axios'
import { 任意接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalEnv } from '../../global/global'
import { 从接口类型获得接口JSON参数 } from './type'

export function 请求用例00<接口类型 extends 任意接口类型>(
  接口类型描述: 接口类型,
  参数: 从接口类型获得接口JSON参数<接口类型>,
): Task<object> {
  return new Task(async () => {
    const env = await GlobalEnv.getInstance().run()

    const method = 接口类型描述.获得方法()
    const urlPath = 接口类型描述.获得路径()
    const url = `http://127.0.0.1:${env.APP_PORT}${urlPath}`

    if (method == 'get') return (await axios.get(url, 参数)).data
    if (method == 'post') return (await axios.post(url, 参数)).data

    throw new Error('意外的请求模式')
  })
}
