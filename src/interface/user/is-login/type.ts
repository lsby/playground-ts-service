import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'
import { Global } from '../../../global/global'

export default new 接口类型(
  '/api/user/is-login',
  'post',
  [
    await Global.getItem('jwt-plugin').then((a) => a.解析器),
    new JSON解析插件(
      z.object({
        body: z.object({}),
      }),
      {},
    ),
  ],
  z.object({
    isLogin: z.boolean(),
  }),
  z.null(),
)
