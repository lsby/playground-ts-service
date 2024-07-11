import { resolve } from 'path'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'
import { Task } from '@lsby/ts-fp-data'
import { JWT管理器 } from '../model/jwt'
import { Kysely管理器 } from '../model/kysely'
import { CronService } from '../tools/common/cron'
import { 环境变量管理器 } from '../tools/common/env'
import { Log } from '../tools/common/log'
import { Package } from '../tools/common/package'
import { DB } from '../types/db'

var 环境变量描述 = z.object({
  APP_PORT: z.coerce.number(),
  DATABASE_PATH: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
})

export class GlobalEnv {
  private static instance: 环境变量管理器<typeof 环境变量描述>
  public static getInstance(): Task<z.infer<typeof 环境变量描述>> {
    if (!GlobalEnv.instance) GlobalEnv.instance = new 环境变量管理器(环境变量描述)
    return GlobalEnv.instance.获得环境变量()
  }

  private constructor() {}
}

export class GlobalLog {
  private static instance: Log
  public static getInstance(): Task<Log> {
    return GlobalPackage.getInstance()
      .getName()
      .map((name) => {
        name = name.replaceAll('/', ':')
        if (!GlobalLog.instance) GlobalLog.instance = new Log(name)
        return GlobalLog.instance
      })
  }

  private constructor() {}
}

export class GlobalPackage {
  private static instance: Package
  public static getInstance(): Package {
    if (!GlobalPackage.instance) GlobalPackage.instance = new Package()
    return GlobalPackage.instance
  }

  private constructor() {}
}

export class GlobalKysely {
  private static instance: Kysely管理器<DB>
  public static getInstance(): Task<Kysely管理器<DB>> {
    if (GlobalKysely.instance) return Task.pure(this.instance)
    return new Task(async () => {
      var env = await GlobalEnv.getInstance().run()
      // 也可以换成其他的方言
      var dialect = new SqliteDialect({
        database: new SQLite(resolve(import.meta.dirname || __dirname, '../../', env.DATABASE_PATH)),
      })
      GlobalKysely.instance = new Kysely管理器<DB>(dialect)
      return GlobalKysely.instance
    })
  }

  private constructor() {}
}

export class GlobalJWT {
  private static instance: JWT管理器
  public static getInstance(): Task<JWT管理器> {
    if (GlobalJWT.instance) return Task.pure(this.instance)

    return new Task(async () => {
      var env = await GlobalEnv.getInstance().run()
      GlobalJWT.instance = new JWT管理器(env.JWT_SECRET, env.JWT_EXPIRES_IN)
      return GlobalJWT.instance
    })
  }

  private constructor() {}
}

export class GlobalCron {
  private static instance: CronService
  public static getInstance(): CronService {
    if (!GlobalCron.instance) {
      GlobalCron.instance = new CronService([])
    }
    return GlobalCron.instance
  }

  private constructor() {}
}
