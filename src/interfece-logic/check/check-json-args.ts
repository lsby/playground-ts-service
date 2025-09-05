import { 取Task插件内部类型, 接口逻辑, 接口逻辑Base, 接口逻辑附加参数类型, 插件项类型 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { TypeOf } from 'zod'

export function JSON参数检查<JSON插件 extends 插件项类型>(
  插件: JSON插件,
): 接口逻辑Base<
  [JSON插件],
  接口逻辑附加参数类型,
  never,
  JSON插件 extends infer 插件项 ? TypeOf<取Task插件内部类型<插件项>> & {} : {},
  null
> {
  return 接口逻辑.构造([插件], async (参数, 逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(JSON参数检查.name)
    return new Right(参数)
  })
}
