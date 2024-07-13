import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'
import { Global } from '../../../global/global'

export default new 接口类型(
  '/api/user/login',
  'post',
  [
    await Global.getItem('jwt-plugin').then((a) => a.签名器),
    new JSON解析插件(
      z.object({
        body: z.object({
          name: z.string(),
          pwd: z.string(),
        }),
      }),
      {},
    ),
  ],
  z.object({
    token: z.string(),
  }),
  z.enum(['用户名或密码错误']),
)
