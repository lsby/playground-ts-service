import { randomUUID } from 'crypto'
import { Just, Maybe, Nothing } from '@lsby/ts-fp-data'
import { Global } from '../global/global'

export class 用户模型 {
  private static async 读取用户(索引字段: 'name' | 'id', 值: string): Promise<Maybe<用户模型>> {
    var db = (await Global.getItem('kysely')).获得句柄()

    var user = await db.selectFrom('user').select(['id', 'name', 'pwd']).where(索引字段, '=', 值).executeTakeFirst()
    if (user == null) return new Nothing()

    return new Just(new 用户模型({ id: user.id, name: user.name, pwd: user.pwd }))
  }

  static async 通过id读取用户(id: string): Promise<Maybe<用户模型>> {
    return 用户模型.读取用户('id', id)
  }
  static async 通过名称读取用户(name: string): Promise<Maybe<用户模型>> {
    return 用户模型.读取用户('name', name)
  }

  static async 创建用户(opt: { name: string; pwd: string }): Promise<用户模型> {
    var db = (await Global.getItem('kysely')).获得句柄()

    var id = randomUUID()
    await db
      .insertInto('user')
      .values({ id, ...opt })
      .execute()

    return new 用户模型({ id, ...opt })
  }

  private constructor(private opt: { id: string; name: string; pwd: string }) {}

  getId(): typeof this.opt.id {
    return this.opt.id
  }
  getPwd(): typeof this.opt.pwd {
    return this.opt.pwd
  }
}
