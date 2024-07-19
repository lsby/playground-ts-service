import { randomUUID } from 'crypto'
import { Just, Maybe, Nothing } from '@lsby/ts-fp-data'
import { Global } from '../global/global'

export class 用户 {
  static async 通过id读取用户(id: string): Promise<Maybe<用户>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select('id').where('id', '=', id).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(new 用户(id))
  }
  static async 通过名称读取用户(name: string): Promise<Maybe<用户>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select('id').where('name', '=', name).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(new 用户(user.id))
  }
  static async 通过名称读取用户基本信息(name: string): Promise<Maybe<{ id: string; name: string; pwd: string }>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select(['id', 'name', 'pwd']).where('name', '=', name).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(user)
  }
  static async 创建用户(name: string, pwd: string): Promise<用户> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var id = randomUUID()
    await db.insertInto('user').values({ id, name, pwd }).execute()
    return new 用户(id)
  }

  private constructor(private id: string) {}

  async getId(): Promise<Maybe<string>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select('id').where('id', '=', this.id).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(user.id)
  }
  async getName(): Promise<Maybe<string>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select('name').where('id', '=', this.id).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(user.name)
  }
  async getPwd(): Promise<Maybe<string>> {
    var db = (await Global.getItem('kysely')).获得句柄()
    var user = await db.selectFrom('user').select('pwd').where('id', '=', this.id).executeTakeFirst()
    if (user == null) return new Nothing()
    return new Just(user.pwd)
  }
}
