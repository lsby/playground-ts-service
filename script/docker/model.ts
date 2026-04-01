export class 日志类 {
  private 上个时间戳: number = Date.now()

  public constructor() {
    this.上个时间戳 = Date.now()
  }

  public 打印(消息: string): void {
    let 现在 = Date.now()
    let 耗时 = 现在 - this.上个时间戳
    this.上个时间戳 = 现在
    console.log(`[+${(耗时 / 1000).toFixed(2)}s] ${消息}`)
  }
}
