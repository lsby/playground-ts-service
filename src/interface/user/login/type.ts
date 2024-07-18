import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'

export default new 包装的接口类型(
  '/api/user/login',
  'post',
  [
    new Task(async () => {
      var jwt = await Global.getItem('jwt-plugin')
      return jwt.签名器
    }),
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          name: z.string(),
          pwd: z.string(),
        }),
        {},
      )
    }),
  ],
  z.object({
    token: z.string(),
  }),
  z.enum(['用户名或密码错误']),
)
