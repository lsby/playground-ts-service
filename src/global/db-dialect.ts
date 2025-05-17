import SQLite from 'better-sqlite3'
// import pg from 'pg'
// import mysql2 from 'mysql2'

import { SqliteDialect } from 'kysely'
// import { PostgresDialect } from 'kysely'
// import { MysqlDialect } from 'kysely'

import { env } from './global'

export let 创建sqlite数据库适配器 = async (): Promise<SqliteDialect> => {
  let e = await env.获得环境变量()
  return new SqliteDialect({ database: new SQLite(e.DATABASE_PATH) })
}
// export let 创建pg数据库适配器 = async (): Promise<PostgresDialect> => {
//   let e = await env.获得环境变量()
//   return new PostgresDialect({
//     pool: new pg.Pool({
//       host: e.DB_HOST,
//       port: e.DB_PORT,
//       user: e.DB_USER,
//       password: e.DB_PWD,
//       database: e.DB_NAME,
//     }),
//   })
// }
// export let 创建mysql数据库适配器 = async (): Promise<MysqlDialect> => {
//   let e = await env.获得环境变量()
//   return new MysqlDialect({
//     pool: mysql2.createPool({
//       host: e.DB_HOST,
//       port: e.DB_PORT,
//       user: e.DB_USER,
//       password: e.DB_PWD,
//       database: e.DB_NAME,
//     }),
//   })
// }
