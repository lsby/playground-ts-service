// ================= better-sqlite3 =================
// import SQLite from 'better-sqlite3'
// import { SqliteDialect } from 'kysely'
// import { 环境变量 } from '../env'

// export let 创建sqlite数据库适配器 = async (): Promise<SqliteDialect> => {
//   return new SqliteDialect({ database: new SQLite(env.DATABASE_PATH) })
// }

// ================= node-sqlite3-wasm =================
import { NodeWasmDialect } from 'kysely-wasm'
import nodeSqlite3Wasm from 'node-sqlite3-wasm'
import { 环境变量 } from '../env'

export let 创建sqlite数据库适配器 = async (): Promise<NodeWasmDialect> => {
  return new NodeWasmDialect({ database: new nodeSqlite3Wasm.Database(环境变量.DATABASE_PATH) })
}

// ================= pg =================
// import { PostgresDialect } from 'kysely'
// import pg from 'pg'
// import { 环境变量 } from '../env'

// export let 创建pg数据库适配器 = async (): Promise<PostgresDialect> => {
//   return new PostgresDialect({
//     pool: new pg.Pool({
//       host: env.DB_HOST,
//       port: env.DB_PORT,
//       user: env.DB_USER,
//       password: env.DB_PWD,
//       database: env.DB_NAME,
//     }),
//   })
// }

// ================= mysql =================
// import { MysqlDialect } from 'kysely'
// import mysql2 from 'mysql2'
// import { 环境变量 } from '../env'

// export let 创建mysql数据库适配器 = async (): Promise<MysqlDialect> => {
//   return new MysqlDialect({
//     pool: mysql2.createPool({
//       host: env.DB_HOST,
//       port: env.DB_PORT,
//       user: env.DB_USER,
//       password: env.DB_PWD,
//       database: env.DB_NAME,
//     }),
//   })
// }
