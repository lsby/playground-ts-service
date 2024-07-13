import jwt from 'jsonwebtoken'

export class JWT管理器<JWT负载 extends string | object | Buffer> {
  constructor(
    private secret: string,
    private expiresIn: string,
  ) {}

  签名(负载: JWT负载): string {
    var token = jwt.sign(负载, this.secret, {
      expiresIn: this.expiresIn,
    })
    return token
  }

  解析(token: string | undefined): JWT负载 | undefined {
    if (token === undefined) {
      return undefined
    }

    token = token.replace('Bearer ', '')
    try {
      return jwt.verify(token, this.secret) as JWT负载
    } catch {
      return undefined
    }
  }
}
