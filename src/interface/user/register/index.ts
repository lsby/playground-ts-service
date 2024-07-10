import { randomUUID } from 'crypto'
import { 接口, 正确JSON结果, 错误JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalKysely } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var db = (await GlobalKysely.getInstance().run()).获得句柄()

    var 存在判定 = await db.selectFrom('user').select('id').where('name', '=', 插件结果.body.name).executeTakeFirst()
    if (存在判定 != null) return new 错误JSON结果('用户名已存在' as '用户名已存在')

    await db
      .insertInto('user')
      .values({
        id: randomUUID(),
        name: 插件结果.body.name,
        pwd: 插件结果.body.pwd,
      })
      .execute()

    return new 正确JSON结果({})
  })
})
