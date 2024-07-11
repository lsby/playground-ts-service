import { 接口, 正确JSON结果, 错误JSON结果 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalJWT, GlobalKysely, GlobalLog } from '../../../global/global'
import 接口类型 from './type'

export default new 接口(接口类型, (插件结果) => {
  return new Task(async () => {
    var log = (await GlobalLog.getInstance().run()).extend('login')

    var db = (await GlobalKysely.getInstance().run()).获得句柄()

    var 存在判定 = await db
      .selectFrom('user')
      .select('id')
      .where('name', '=', 插件结果.body.name)
      .where('pwd', '=', 插件结果.body.pwd)
      .executeTakeFirst()
    if (存在判定 == null) {
      await log.err('用户名或密码错误').run()
      return new 错误JSON结果('用户名或密码错误' as '用户名或密码错误')
    }

    var jwt = await GlobalJWT.getInstance().run()
    var token = jwt.签名(存在判定.id)

    return new 正确JSON结果({ token })
  })
})
