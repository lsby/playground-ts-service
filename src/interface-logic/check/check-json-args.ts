import { JSON解析插件, 合并插件结果, 接口逻辑, 接口逻辑附加参数类型, 请求附加参数类型 } from '@lsby/net-core'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

export class 检查JSON参数<描述类型 extends z.AnyZodObject> extends 接口逻辑<
  [Task<JSON解析插件<描述类型>>],
  接口逻辑附加参数类型,
  never,
  z.TypeOf<描述类型> & {}
> {
  private 插件: Task<JSON解析插件<描述类型>>

  public constructor(描述: 描述类型, 参数: ConstructorParameters<typeof JSON解析插件<any>>['1'] = {}) {
    super()
    this.插件 = new Task(async () => new JSON解析插件(描述, 参数))
  }

  public override 获得插件们(): [Task<JSON解析插件<描述类型>>] {
    return [this.插件]
  }

  public override async 实现(
    参数: 合并插件结果<[Task<JSON解析插件<描述类型>>]>,
    逻辑附加参数: 接口逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<never, z.TypeOf<描述类型>>> {
    let _log = 请求附加参数.log.extend(检查JSON参数.name)
    return new Right(参数)
  }
}
