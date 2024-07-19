import { 包装的正确JSON结果, 包装的错误JSON结果, 接口 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import { 用户 } from '../../../model/user'
import 接口类型 from './type'

export default new 接口(接口类型, async (ctx) => {
  var log = (await Global.getItem('log')).extend('login')

  var 存在判定 = await 用户.通过名称读取用户(ctx.body.name)
  if (存在判定.getJustOrNull() != null) {
    await log.err('用户名已存在: %o', ctx.body.name)
    return new 包装的错误JSON结果('用户名已存在' as const)
  }

  await 用户.不安全的创建用户(ctx.body.name, ctx.body.pwd)

  return new 包装的正确JSON结果({
    state: 'success' as const,
  })
})
