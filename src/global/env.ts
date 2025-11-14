import { Env } from '@lsby/ts-env'
import { z } from 'zod'

export let 环境变量 = await new Env({
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    // 环境名称
    NODE_ENV: z.enum(['development', 'production', 'test']),
    // 调试名称
    DEBUG_NAME: z.string(),
    // 数据库部分 开始
    DB_TYPE: z.enum(['sqlite', 'pg', 'mysql']),
    // sqlite
    DB_PATH: z.string(),
    DB_BACKUP_PATH: z.string(),
    DB_BACKUP_PREFIX: z.string(),
    DB_BACKUP_AUTO_PREFIX: z.string(),
    DB_BACKUP_RETENTION_DAYS: z.coerce.number(),
    // pg/mysql
    // DB_USER: z.string(),
    // DB_PWD: z.string(),
    // DB_HOST: z.string(),
    // DB_PORT: z.coerce.number(),
    // DB_NAME: z.string(),
    // SHADOW_DB_NAME: z.string(),
    // 数据库部分 结束
    // 应用端口
    APP_PORT: z.coerce.number(),
    WEB_PORT: z.coerce.number(),
    // 系统用户
    SYSTEM_USER: z.string(),
    SYSTEM_PWD: z.string(),
    // 文件上传
    UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
    // JWT
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
  }),
}).获得环境变量()
