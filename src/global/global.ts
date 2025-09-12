import { JWT插件 } from '@lsby/net-core-jwt'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { CronService } from '@lsby/ts-cron'
import { Env } from '@lsby/ts-env'
import { GlobalAsyncItem, GlobalItem, GlobalService } from '@lsby/ts-global'
import { Kysely管理器 } from '@lsby/ts-kysely'
import { Log } from '@lsby/ts-log'
import { z } from 'zod'
import { DB } from '../types/db'
import { 创建sqlite数据库适配器 } from './db-dialect'

export let CONST = {
  INIT_FLAG: 'INIT_FLAG',
}

export let env = new Env({
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DEBUG_NAME: z.string(),
    // DB START
    DB_TYPE: z.enum(['sqlite', 'pg', 'mysql']),
    // sqlite
    DATABASE_PATH: z.string(),
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
})

export let Global = new GlobalService([
  new GlobalItem('env', env),
  new GlobalItem('cron', new CronService()),
  new GlobalAsyncItem('DB_TYPE', async () => {
    let e = await env.获得环境变量()
    return e.DB_TYPE
  }),
  new GlobalAsyncItem('log', async () => {
    let e = await env.获得环境变量()
    return new Log(e.DEBUG_NAME)
  }),
  new GlobalAsyncItem('kysely', async () => {
    return Kysely管理器.从适配器创建<DB>(await 创建sqlite数据库适配器())
    // return Kysely管理器.从适配器创建<DB>(await 创建pg数据库适配器())
    // return Kysely管理器.从适配器创建<DB>(await 创建mysql数据库适配器())
  }),
  new GlobalAsyncItem('jwt-plugin', async () => {
    let e = await env.获得环境变量()
    return new JWT插件(z.object({ userId: z.string().or(z.undefined()) }), e.JWT_SECRET, e.JWT_EXPIRES_IN)
  }),
  new GlobalAsyncItem('kysely-plugin', async (): Promise<Kysely插件<'kysely', DB>> => {
    return new Kysely插件('kysely', await Global.getItem('kysely'))
  }),
])
