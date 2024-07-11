import { randomUUID } from 'crypto'
import { Just, Maybe, Nothing, Task } from '@lsby/ts-fp-data'
import { GlobalKysely } from '../global/global'

export class 用户 {
  static 通过id读取用户(id: string): Task<Maybe<用户>> {
    return new Task(async () => {
      var db = (await GlobalKysely.getInstance().run()).获得句柄()

      var user = await db.selectFrom('user').select(['id', 'name', 'pwd']).where('id', '=', id).executeTakeFirst()
      if (user == null) return new Nothing()

      return new Just(new 用户({ id: user.id, name: user.name, pwd: user.pwd }))
    })
  }
  static 通过名称读取用户(name: string): Task<Maybe<用户>> {
    return new Task(async () => {
      var db = (await GlobalKysely.getInstance().run()).获得句柄()

      var user = await db.selectFrom('user').select(['id', 'name', 'pwd']).where('name', '=', name).executeTakeFirst()
      if (user == null) return new Nothing()

      return new Just(new 用户({ id: user.id, name: user.name, pwd: user.pwd }))
    })
  }
  static 创建用户(opt: { name: string; pwd: string }): Task<用户> {
    return new Task(async () => {
      var db = (await GlobalKysely.getInstance().run()).获得句柄()

      var id = randomUUID()
      await db
        .insertInto('user')
        .values({ id, ...opt })
        .execute()

      return new 用户({ id, ...opt })
    })
  }

  private constructor(private opt: { id: string; name: string; pwd: string }) {}
}
