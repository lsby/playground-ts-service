import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { JWT管理器 } from '../model/jwt'

export class JWT签名插件 extends 插件<
  z.ZodObject<{ signJwt: z.ZodFunction<z.ZodTuple<[z.ZodString], null>, z.ZodString> }>
> {
  constructor(jwt: JWT管理器) {
    super(
      z.object({ signJwt: z.function(z.tuple([z.string()]), z.string()) }),
      (_request, _response) =>
        new Task(async () => {
          const signJwt = (token: string): string => jwt.签名(token)
          return { signJwt }
        }),
    )
  }
}

export class JWT解析插件 extends 插件<
  z.ZodObject<{
    userId: z.ZodUnion<[z.ZodString, z.ZodUndefined]>
  }>
> {
  constructor(jwt: JWT管理器) {
    super(
      z.object({ userId: z.string().or(z.undefined()) }),
      (request, _response) =>
        new Task(async () => {
          const userId = jwt.解析(request.headers.authorization ?? undefined)
          return { userId }
        }),
    )
  }
}
