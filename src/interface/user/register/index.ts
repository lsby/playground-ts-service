import { randomUUID } from 'crypto'
import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  var log = (await Global.getItem('log')).extend('login')
  var db = (await Global.getItem('kysely')).获得句柄()

  var user = await db.selectFrom('user').select('id').where('name', '=', ctx.body.name).executeTakeFirst()
  if (user != null) {
    await log.err('用户名已存在: %o', ctx.body.name)
    return new 包装的错误JSON结果('用户名已存在' as const)
  }

  await db.insertInto('user').values({ id: randomUUID(), name: ctx.body.name, pwd: ctx.body.pwd }).execute()

  return new 包装的正确JSON结果({
    state: 'success' as const,
  })
})
