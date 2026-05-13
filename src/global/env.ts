import { Env } from '@lsby/ts-env'
import { z } from 'zod'

export let 环境变量 = new Env({
  环境变量名称: 'ENV_FILE_PATH',
  环境描述: z.object({
    // 环境名称
    NODE_ENV: z.enum(['development', 'production', 'test']),
    /**
     * 代码布局策略
     * 用于决定如何根据当前 JS 文件的位置（import.meta.dirname）推导出项目根目录。
     * - source: 代码在 src 目录下（开发模式），根目录为 ../../
     * - dist: 代码在 dist/src 目录下（构建模式），根目录为 ../../../
     * - flat: 代码在根目录或包内（SEA 模式），根目录为 ./
     */
    CODE_LAYOUT: z.enum(['source', 'dist', 'flat']),
    // 调试名称
    DEBUG_NAME: z.string(),
    // ========= 数据库部分 开始 =========
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
    // ========= 数据库部分 结束 =========
    // 应用端口
    APP_PORT: z.coerce.number(),
    WEB_PORT: z.coerce.number(),
    WEB_HMR_PORT: z.coerce.number(),
    // 系统用户
    DEFAULT_SYSTEM_USER: z.string(),
    DEFAULT_SYSTEM_PWD: z.string(),
    // 文件上传
    UPLOAD_MAX_FILE_SIZE: z.coerce.number(),
    // JWT
    DEFAULT_JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    // bcrypt
    BCRYPT_ROUNDS: z.coerce.number(),
  }),
}).获得环境变量()
