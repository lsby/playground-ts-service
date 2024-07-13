import { resolve } from 'path'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'
import { CronService } from '../tool/common/cron'
import { 环境变量管理器 } from '../tool/common/env'
import { Kysely管理器 } from '../tool/common/kysely'
import { Log } from '../tool/common/log'
import { Package } from '../tool/common/package'
import { DB } from '../types/db'

var 环境变量描述 = z.object({
  APP_PORT: z.coerce.number(),
  DATABASE_PATH: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
})

export class GlobalPackage {
  private static instance: Package | null = null
  public static getInstance(): Package {
    if (!GlobalPackage.instance) GlobalPackage.instance = new Package()
    return GlobalPackage.instance
  }

  private constructor() {}
}

export class GlobalLog {
  private static instance: Log | null = null
  public static async getInstance(): Promise<Log> {
    return GlobalPackage.getInstance()
      .getName()
      .then((name) => {
        name = name.replaceAll('/', ':')
        if (!GlobalLog.instance) GlobalLog.instance = new Log(name)
        return GlobalLog.instance
      })
  }

  private constructor() {}
}

export class GlobalEnv {
  private static instance: 环境变量管理器<typeof 环境变量描述> | null = null
  public static async getInstance(): Promise<z.infer<typeof 环境变量描述>> {
    if (!GlobalEnv.instance) GlobalEnv.instance = new 环境变量管理器(环境变量描述)
    return GlobalEnv.instance.获得环境变量()
  }

  private constructor() {}
}

export class GlobalKysely {
  private static instance: Kysely管理器<DB> | null = null
  public static async getInstance(): Promise<Kysely管理器<DB>> {
    if (GlobalKysely.instance) return GlobalKysely.instance
    var env = await GlobalEnv.getInstance()
    // 也可以换成其他的方言
    var dialect = new SqliteDialect({
      database: new SQLite(resolve(import.meta.dirname || __dirname, '../../', env.DATABASE_PATH)),
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
