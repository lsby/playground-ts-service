import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalJWT } from '../global/global'

var 类型描述 = z.object({
  userId: z.string().or(z.undefined()),
})

export class JWT解析插件 extends 插件<typeof 类型描述> {
  constructor() {
    super(
      类型描述,
      (req, _res) =>
        new Task(async () => {
          var jwt = await GlobalJWT.getInstance().run()
          var userId = jwt.解析(req.headers.authorization ?? undefined)
          return { userId }
        }),
    )
  }
}
