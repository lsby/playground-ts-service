import jwt from 'jsonwebtoken'

interface JWT负载 {
  userId: string
}

export class JWT管理器 {
  constructor(
    private secret: string,
    private expiresIn: string,
  ) {}

  签名(userId: string): string {
    var token = jwt.sign({ userId } as JWT负载, this.secret, {
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
      var { userId } = jwt.verify(token, this.secret) as JWT负载
      return userId
    } catch {
      return undefined
    }
  }
}
