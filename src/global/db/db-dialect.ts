// ================= better-sqlite3 =================
// import SQLite from 'better-sqlite3'
// import { SqliteDialect } from 'kysely'

// export let 创建原生sqlite数据库适配器 = async (path: string): Promise<SqliteDialect> => {
//   return new SqliteDialect({ database: new SQLite(path) })
// }

// ================= node-sqlite3-wasm =================
import { NodeWasmDialect } from 'kysely-wasm'
import nodeSqlite3Wasm from 'node-sqlite3-wasm'

export let 创建sqlite数据库适配器 = async (path: string): Promise<NodeWasmDialect> => {
  return new NodeWasmDialect({ database: new nodeSqlite3Wasm.Database(path) })
}

// ================= pg =================
// import { PostgresDialect } from 'kysely'
// import pg from 'pg'

// export let 创建pg数据库适配器 = async (opt: pg.PoolConfig): Promise<PostgresDialect> => {
//   return new PostgresDialect({ pool: new pg.Pool(opt) })
// }

// ================= mysql =================
// import { MysqlDialect } from 'kysely'
// import mysql2 from 'mysql2'

// export let 创建mysql数据库适配器 = async (opt: mysql2.PoolOptions): Promise<MysqlDialect> => {
//   return new MysqlDialect({ pool: mysql2.createPool(opt) })
// }
