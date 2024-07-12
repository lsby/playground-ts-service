import { Dialect, Kysely } from 'kysely'

export class Kysely管理器<DB> {
  private 句柄: Kysely<DB>

  constructor(dialect: Dialect) {
    this.句柄 = new Kysely<DB>({ dialect })
  }

  获得句柄(): Kysely<DB> {
    return this.句柄
  }

  执行事务<A>(func: (trx: Kysely<DB>) => Promise<A>): Promise<A> {
    return this.句柄.connection().execute(async (db) => {
      return db.transaction().execute(async (trx) => {
        return func(trx)
      })
    })
  }
}
