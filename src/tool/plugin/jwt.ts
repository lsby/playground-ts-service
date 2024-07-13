import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { JWT管理器 } from '../common/jwt'

class JWT解析插件<解析器类型描述Zod extends z.AnyZodObject> extends 插件<解析器类型描述Zod> {
  constructor(类型表示: 解析器类型描述Zod, jwt实例: JWT管理器<z.infer<typeof 类型表示>>) {
    super(类型表示, async (req, _res) => {
      var data = jwt实例.解析(req.headers.authorization ?? undefined)
      return data || {}
    })
  }
}
class JWT签名插件<解析器类型描述Zod extends z.AnyZodObject> extends 插件<
  z.ZodObject<{
    signJwt: z.ZodFunction<z.ZodTuple<[解析器类型描述Zod], null>, z.ZodString>
  }>
> {
  constructor(类型表示: 解析器类型描述Zod, jwt实例: JWT管理器<z.infer<typeof 类型表示>>) {
    super(
      z.object({
        signJwt: z.function(z.tuple([类型表示]), z.string()),
      }),
      async (_req, _res) => {
        var signJwt = (data: z.infer<typeof 类型表示>): string => jwt实例.签名(data)
        return { signJwt }
      },
    )
  }
}

export class JWT插件<解析器类型描述Zod extends z.AnyZodObject> {
  private jwt实例: JWT管理器<解析器类型描述Zod>
  public 解析器: JWT解析插件<解析器类型描述Zod>
  public 签名器: JWT签名插件<解析器类型描述Zod>

  constructor(类型表示: 解析器类型描述Zod, 密钥: string, 过期时间: string) {
    this.jwt实例 = new JWT管理器(密钥, 过期时间)
    this.解析器 = new JWT解析插件(类型表示, this.jwt实例)
    this.签名器 = new JWT签名插件(类型表示, this.jwt实例)
  }
}
