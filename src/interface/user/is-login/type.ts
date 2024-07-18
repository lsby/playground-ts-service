import { z } from 'zod'
import { JSON解析插件, 包装的接口类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'

export default new 包装的接口类型(
  '/api/user/is-login',
  'post',
  [
    new Task(async () => {
      var jwt = await Global.getItem('jwt-plugin')
      return jwt.解析器
    }),
    new Task(async () => {
      return new JSON解析插件(z.object({}), {})
    }),
  ],
  z.object({
    isLogin: z.boolean(),
  }),
  z.never(),
)
