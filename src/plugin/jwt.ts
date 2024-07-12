import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { GlobalJWT } from '../global/global'

var 类型描述 = z.object({
  userId: z.string().or(z.undefined()),
})

export class JWT解析插件 extends 插件<typeof 类型描述> {
  constructor() {
    super(类型描述, async (req, _res) => {
      var jwt = await GlobalJWT.getInstance()
      var userId = jwt.解析(req.headers.authorization ?? undefined)
      return { userId }
    })
  }
}
