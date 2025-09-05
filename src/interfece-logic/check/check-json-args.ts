import { JSON解析插件, 接口逻辑, 接口逻辑Base, 接口逻辑附加参数类型 } from '@lsby/net-core'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

export function 检查JSON参数<描述类型 extends z.AnyZodObject>(
  描述: 描述类型,
): 接口逻辑Base<[Task<JSON解析插件<描述类型>>], 接口逻辑附加参数类型, never, z.TypeOf<描述类型> & {}, null> {
  return 接口逻辑.构造([new Task(async () => new JSON解析插件(描述, {}))], async (参数, 逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(检查JSON参数.name)
    return new Right(参数)
  })
}
