import { JWT插件 } from '@lsby/net-core-jwt'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { z } from 'zod'
import { 环境变量 } from './env'
import { kysely管理器 } from './global'

export let jwt插件 = new JWT插件(
  z.object({ userId: z.string().or(z.undefined()) }),
  环境变量.JWT_SECRET,
  环境变量.JWT_EXPIRES_IN,
)
export let kysely插件 = new Kysely插件('kysely', kysely管理器)
