import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'
import { Env } from '@lsby/ts-env'
import { GlobalAsyncItem, GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import { CronService } from '../tool/common/cron'
import { Kysely管理器 } from '../tool/common/kysely'
import { JWT插件 } from '../tool/plugin/jwt'
import { DB } from '../types/db'

var env = new Env({
  模式: '通过环境变量指定文件路径',
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    APP_PORT: z.coerce.number(),
    DEBUG_NAME: z.string(),
    DATABASE_PATH: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
  }),
})

export var Global = new GlobalService([
  new GlobalItem('log', new Log('playground-service')),
  new GlobalItem('env', env),
  new GlobalItem('cron', new CronService()),
  new GlobalAsyncItem('kysely', () =>
    env
      .获得环境变量()
      .then((env) => new Kysely管理器<DB>(new SqliteDialect({ database: new SQLite(env.DATABASE_PATH) }))),
  ),
  new GlobalAsyncItem('jwt-plugin', () =>
    env.获得环境变量().then((env) => new JWT插件(env.JWT_SECRET, env.JWT_EXPIRES_IN)),
  ),
])
