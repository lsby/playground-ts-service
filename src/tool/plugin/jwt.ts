import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { JWT管理器 } from '../common/jwt'

interface JWT负载 {
  userId: string
}

var 解析器类型描述 = z.object({
  userId: z.string().or(z.undefined()),
})
var 签名器类型描述 = z.object({
  signJwt: z.function(z.tuple([z.string()]), z.string()),
})

class JWT解析插件 extends 插件<typeof 解析器类型描述> {
  constructor(jwt实例: JWT管理器<JWT负载>) {
    super(解析器类型描述, async (req, _res) => {
      var data = jwt实例.解析(req.headers.authorization ?? undefined)
      return { userId: data?.userId }
    })
  }
}
class JWT签名插件 extends 插件<typeof 签名器类型描述> {
  constructor(jwt实例: JWT管理器<JWT负载>) {
    super(签名器类型描述, async (_req, _res) => {
      var signJwt = (userId: string): string => jwt实例.签名({ userId })
      return { signJwt }
    })
  }
}

export class JWT插件 {
  private jwt实例: JWT管理器<JWT负载>
  public 解析器: JWT解析插件
  public 签名器: JWT签名插件

  constructor(密钥: string, 过期时间: string) {
    this.jwt实例 = new JWT管理器(密钥, 过期时间)
    this.解析器 = new JWT解析插件(this.jwt实例)
    this.签名器 = new JWT签名插件(this.jwt实例)
  }
}
