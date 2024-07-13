import { z } from 'zod'
import { JSON解析插件, 接口类型 } from '@lsby/net-core'
import { GlobalEnv } from '../../../global/global'
import { JWT插件 } from '../../../tool/plugin/jwt'

export default new 接口类型(
  '/api/user/is-login',
  'post',
  [
    GlobalEnv.getInstance().then((env) =>
      JWT插件.getInstance(env.JWT_SECRET, env.JWT_EXPIRES_IN).then((jwt) => jwt.解析器),
    ),
    Promise.resolve(
      new JSON解析插件(
        z.object({
          body: z.object({}),
        }),
        {},
      ),
    ),
  ],
  z.object({
    isLogin: z.boolean(),
  }),
  z.null(),
)
