import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalJWT } from '../global/global'

export class JWT解析插件 extends 插件<
  z.ZodObject<{
    userId: z.ZodUnion<[z.ZodString, z.ZodUndefined]>
  }>
> {
  constructor() {
    super(
      z.object({ userId: z.string().or(z.undefined()) }),
      (request, _response) =>
        new Task(async () => {
          var jwt = await GlobalJWT.getInstance().run()
          const userId = jwt.解析(request.headers.authorization ?? undefined)
          return { userId }
        }),
    )
  }
}
