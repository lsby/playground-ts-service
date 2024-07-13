import { existsSync } from 'fs'
import { resolve } from 'path'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'
import { Env } from '@lsby/ts-env'
import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import { CronService } from '../tool/common/cron'
import { Kysely管理器 } from '../tool/common/kysely'
import { DB } from '../types/db'

export var Global = new GlobalService([
  new GlobalItem('log', new Log('playground-service')),
  new GlobalItem(
    'env',
    new Env({
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
    }),
  ),
])

export class GlobalKysely {
  private static instance: Kysely管理器<DB> | null = null
  public static async getInstance(): Promise<Kysely管理器<DB>> {
    if (GlobalKysely.instance) return GlobalKysely.instance
    var log = await Global.getItem('log')
    var env = await (await Global.getItem('env')).获得环境变量()
    // 也可以换成其他的方言
    var dbPath = resolve(env.DATABASE_PATH)
    await log.debug('读取数据库路径: %o', dbPath)
    if (!existsSync(dbPath)) throw new Error('无法读取数据库, 文件不存在')
    var dialect = new SqliteDialect({
      database: new SQLite(dbPath),
    })
    GlobalKysely.instance = new Kysely管理器<DB>(dialect)
    return GlobalKysely.instance
  }

  private constructor() {}
}

export class GlobalCron {
  private static instance: CronService | null = null
  public static getInstance(): CronService {
    if (!GlobalCron.instance) GlobalCron.instance = new CronService([])
    return GlobalCron.instance
  }

  private constructor() {}
}
