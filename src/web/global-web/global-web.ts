import axios from 'axios'
import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Get请求后端函数类型, Post请求后端函数类型 } from '../../types/interface-type'

class 后端客户端 {
  private token: string | undefined

  post: Post请求后端函数类型 = async (路径, 参数) => {
    return (await axios.post(路径, 参数, { headers: { authorization: this.token } })).data
  }
  get: Get请求后端函数类型 = async (路径, 参数) => {
    return (await axios.get(路径, { ...参数, headers: { authorization: this.token } })).data
  }

  async 登录(用户名: string, 密码: string): Promise<void> {
    var c = await this.post('/api/user/login', { name: 用户名, pwd: 密码 })
    if (c.state == 'fail') throw new Error(c.error)
    this.token = c.token
  }
}

export var GlobalWeb = new GlobalService([new GlobalItem('后端客户端', new 后端客户端())])
