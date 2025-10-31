import { Env } from '@lsby/ts-env'
import { z } from 'zod'

export let 环境变量 = await new Env({
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
