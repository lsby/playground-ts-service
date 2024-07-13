import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import { JWT插件 } from '../../../tool/plugin/jwt'

export default new 接口类型(
  '/api/user/login',
  'post',
  [
    (await Global.getItem('env'))
      .获得环境变量()
      .then((env) => JWT插件.getInstance(env.JWT_SECRET, env.JWT_EXPIRES_IN).then((jwt) => jwt.签名器)),
    Promise.resolve(
      new JSON解析插件(
        z.object({
          body: z.object({
            name: z.string(),
            pwd: z.string(),
          }),
        }),
        {},
      ),
    ),
  ],
  z.object({
    token: z.string(),
  }),
  z.enum(['用户名或密码错误']),
)
