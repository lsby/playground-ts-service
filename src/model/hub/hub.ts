export type 集线器监听id = string

export type 集线器监听<消息类型> = {
  监听id: 集线器监听id
  发送消息: (消息: 消息类型) => void
}

export class 集线器<消息类型> {
  private 监听列表: Map<集线器监听id, 集线器监听<消息类型>> = new Map()

  public 监听消息(监听id: string, 接收消息回调: (消息: 消息类型) => void): 集线器监听<消息类型> {
    let 监听: 集线器监听<消息类型> = {
      监听id: 监听id,
      发送消息: (消息: 消息类型) => {
        this.监听列表.forEach((当前监听, 当前监听的监听id) => {
          if (监听id === 当前监听的监听id) return
          当前监听.发送消息(消息)
        })
      },
    }

    this.监听列表.set(监听id, {
      监听id: 监听id,
      发送消息: 接收消息回调,
    })

    return 监听
  }

  public 获得监听数量(): number {
    return this.监听列表.size
  }

  public 断开监听(监听id: 集线器监听id): void {
    this.监听列表.delete(监听id)
  }
  public 清空所有监听(): void {
    this.监听列表.clear()
  }

  public 广播消息(消息: 消息类型): void {
    this.监听列表.forEach((监听) => {
      监听.发送消息(消息)
    })
  }
}
