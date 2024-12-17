import { JWT插件 } from '@lsby/net-core-jwt'
import { Kysely插件 } from '@lsby/net-core-kysely'
import { CronService } from '@lsby/ts-cron'
import { Env } from '@lsby/ts-env'
import { GlobalAsyncItem, GlobalItem, GlobalService } from '@lsby/ts-global'
import { Kysely管理器 } from '@lsby/ts-kysely'
import { Log } from '@lsby/ts-log'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'
import { DB } from '../types/db'

export let CONST = {
  INIT_FLAG: 'INIT_FLAG',
}

let env = new Env({
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DEBUG_NAME: z.string(),
    DB_TYPE: z.enum(['sqlite', 'pg']),
    DATABASE_PATH: z.string(),
    APP_PORT: z.coerce.number(),
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
    let e = await env.获得环境变量()
    return new Kysely管理器<DB>(new SqliteDialect({ database: new SQLite(e.DATABASE_PATH) }))
  }),
  new GlobalAsyncItem('jwt-plugin', async () => {
    let e = await env.获得环境变量()
    return new JWT插件(z.object({ userId: z.string().or(z.undefined()) }), e.JWT_SECRET, e.JWT_EXPIRES_IN)
  }),
  new GlobalAsyncItem('kysely-plugin', async () => {
    let e = await env.获得环境变量()
    return new Kysely插件(
      'kysely',
      new Kysely管理器<DB>(new SqliteDialect({ database: new SQLite(e.DATABASE_PATH) })).获得句柄(),
    )
  }),
])
