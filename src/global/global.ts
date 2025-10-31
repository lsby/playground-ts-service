import { JWT插件 } from '@lsby/net-core-jwt'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { Env } from '@lsby/ts-env'
import { Kysely管理器 } from '@lsby/ts-kysely'
import { Log } from '@lsby/ts-log'
import { z } from 'zod'
import { 即时任务管理器 } from '../model/instant-job/instant-job-manager'
import { 定时任务管理器 } from '../model/scheduled-job/scheduled-job-manager'
import { DB } from '../types/db'
import { 创建sqlite数据库适配器 } from './db-dialect'

export let CONST = {
  INIT_FLAG: 'INIT_FLAG',
}

export let env = await new Env({
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DEBUG_NAME: z.string(),
    // DB START
    DB_TYPE: z.enum(['sqlite', 'pg', 'mysql']),
    // sqlite
    DATABASE_PATH: z.string(),
    DATABASE_BACKUP_PATH: z.string(),
    DATABASE_BACKUP_PREFIX: z.string(),
    DATABASE_BACKUP_AUTO_PREFIX: z.string(),
    DATABASE_BACKUP_RETENTION_DAYS: z.coerce.number(),
    // pg/mysql
    // DB_USER: z.string(),
    // DB_PWD: z.string(),
    // DB_HOST: z.string(),
    // DB_PORT: z.coerce.number(),
    // DB_NAME: z.string(),
    // SHADOW_DB_NAME: z.string(),
    // DB END
    APP_PORT: z.coerce.number(),
    WEB_PORT: z.coerce.number(),
    SYSTEM_USER: z.string(),
    SYSTEM_PWD: z.string(),
    UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
  }),
}).获得环境变量()

export let scheduledJob = new 定时任务管理器()
export let instantJob = new 即时任务管理器({ 最大并发数: 10, 历史记录保留天数: 7 })
export let globalLog = new Log(env.DEBUG_NAME)
export let kysely = await (async function (): Promise<Kysely管理器<DB>> {
  return Kysely管理器.从适配器创建<DB>(
    await 创建sqlite数据库适配器(),
    env.NODE_ENV === 'production' ? [] : ['query', 'error'],
  )
  // return Kysely管理器.从适配器创建<DB>(
  //   await 创建pg数据库适配器(),
  //   e.NODE_ENV === 'production' ? [] : ['query', 'error'],
  // )
  // return Kysely管理器.从适配器创建<DB>(
  //   await 创建mysql数据库适配器(),
  //   e.NODE_ENV === 'production' ? [] : ['query', 'error'],
  // )
})()

export let jwtPlugin = new JWT插件(
  z.object({ userId: z.string().or(z.undefined()) }),
  env.JWT_SECRET,
  env.JWT_EXPIRES_IN,
)
export let kyselyPlugin = new Kysely插件('kysely', kysely)
