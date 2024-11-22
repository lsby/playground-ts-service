import { 业务行为 } from '@lsby/net-core'
import { Either, Right } from '@lsby/ts-fp-data'

type 输入 = {
  ws操作?:
    | {
        发送ws信息: (data: { data: string }) => Promise<void>
        关闭ws连接: () => Promise<void>
      }
    | undefined
}
type 错误 = never
type 输出 = {}

export class WebSocket测试 extends 业务行为<输入, 错误, 输出> {
  protected override async 业务行为实现(参数: 输入): Promise<Either<错误, 输出>> {
    var 数据 = ['你', '好', '世', '界']
    var 当前索引 = 0

    var 定时器句柄 = setInterval(async () => {
      var 当前数据 = 数据[当前索引]
      当前索引++
      if (当前数据 == null) {
        clearInterval(定时器句柄)
        await 参数.ws操作?.关闭ws连接()
        return
      }
      await 参数.ws操作?.发送ws信息({ data: 当前数据 })
    }, 1000)

    return new Right({})
  }
}
