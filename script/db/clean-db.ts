import { CompiledQuery, Kysely } from 'kysely'
import { 环境变量 } from '../../src/global/env'
import { DB } from '../../src/types/db'

export async function cleanDB(db: Kysely<DB>): Promise<void> {
  const DB_TYPE = 环境变量.DB_TYPE

  switch (DB_TYPE) {
    case 'sqlite': {
      var 删除语句 = (
        await db.executeQuery(
          CompiledQuery.raw(
            [
              // ..
              `SELECT name`,
              `FROM sqlite_master`,
              `WHERE type = 'table'`,
              `AND name NOT LIKE 'sqlite_%';`,
            ].join('\n'),
            [],
          ),
        )
      ).rows.map((row: any) => `DELETE FROM ${row.name};`)

      // 关闭外键约束
      await db.executeQuery(CompiledQuery.raw('PRAGMA foreign_keys = OFF;', []))

      // 开始事务
      await db.transaction().execute(async (trx) => {
        for (var statement of 删除语句) {
          await trx.executeQuery(CompiledQuery.raw(statement, []))
        }
      })

      // 打开外键约束
      await db.executeQuery(CompiledQuery.raw('PRAGMA foreign_keys = ON;', []))

      break
    }
    case 'pg': {
      try {
        // 获取所有表的名称
        const tables = (
          await db.executeQuery(
            CompiledQuery.raw(
              `
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
              `,
              [],
            ),
          )
        ).rows.map((row: any) => row.tablename)

        // 清除每个表的数据
        for (const table of tables) {
          await db.executeQuery(CompiledQuery.raw(`TRUNCATE TABLE "${table}" CASCADE`, []))
        }
      } catch (error) {
        console.error('Error cleaning tables:', error)
      }

      break
    }
  }
}
