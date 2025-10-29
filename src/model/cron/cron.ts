export abstract class Cron抽象类 {
  public static 创建Cron(配置: {
    名称: string
    定时表达式: () => Promise<`${string} ${string} ${string} ${string} ${string} ${string}`>
    执行函数: () => Promise<void>
  }): Cron抽象类 {
    let cron配置 = 配置
    return new (class extends Cron抽象类 {
      public getName(): string {
        return cron配置.名称
      }

      public async getCron(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`> {
        return await cron配置.定时表达式()
      }

      public async run(): Promise<void> {
        await cron配置.执行函数()
      }
    })()
  }

  public abstract getName(): string
  public abstract getCron(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`>
  public abstract run(): Promise<void>
}
