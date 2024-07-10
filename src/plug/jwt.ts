import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'

interface JWT负载 {
  userId: string
}

export class JWT管理器 {
  constructor(
    private secret: string,
    private expiresIn: string,
  ) {}

  签名(userId: string): string {
    const token = jwt.sign({ userId } as JWT负载, this.secret, {
      expiresIn: this.expiresIn,
    })
    return token
  }

  解析(token: string | undefined): string | undefined {
    if (token === undefined) {
      return undefined
    }

    token = token.replace('Bearer ', '')
    try {
      const { userId } = jwt.verify(token, this.secret) as JWT负载
      return userId
    } catch {
      return undefined
    }
  }
}

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
