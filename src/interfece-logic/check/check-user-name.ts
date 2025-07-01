import { JSON解析插件, 接口逻辑, 构造元组, 构造对象 } from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑附加参数类型 = any
type 逻辑错误类型 = '用户名不能包含空格' | '用户名不能为空' | '用户名过短' | '用户名过长'
type 逻辑正确类型<字段类型 extends string> = Record<字段类型, string>

export function 检查用户名<字段类型 extends string>(
  字段名: 字段类型,
  插件 = 构造元组([new Task(async () => new JSON解析插件(z.object({ ...构造对象(字段名, z.string()) }), {}))]),
): 接口逻辑<typeof 插件, 逻辑附加参数类型, 逻辑错误类型, 逻辑正确类型<字段类型>> {
  return 接口逻辑.构造(插件, async (参数, _逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(检查用户名.name)
    if (参数[字段名].includes(' ')) return new Left('用户名不能包含空格')
    if (参数[字段名] === '') return new Left('用户名不能为空')
    if (参数[字段名].length < 5) return new Left('用户名过短')
    if (参数[字段名].length > 20) return new Left('用户名过长')
    return new Right<never, Record<字段类型, string>>(构造对象(字段名, 参数[字段名]))
  })
}
