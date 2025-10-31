import { JSON解析插件, 合并插件结果, 接口逻辑, 构造对象, 请求附加参数类型 } from '@lsby/net-core'
import { Either, Left, Right } from '@lsby/ts-fp-data'
import { z } from 'zod'

type 逻辑错误类型 = '用户名不能包含空格' | '用户名不能为空' | '用户名过短' | '用户名过长'
type 逻辑正确类型<字段类型 extends string> = Record<字段类型, string>

export class 检查用户名<逻辑附加参数类型 extends {}, 字段类型 extends string> extends 接口逻辑<
  [JSON解析插件<z.ZodObject<{ [K in 字段类型]: z.ZodString }>>],
  逻辑附加参数类型,
  逻辑错误类型,
  逻辑正确类型<字段类型>
> {
  private 插件: [JSON解析插件<z.ZodObject<{ [K in 字段类型]: z.ZodString }>>]

  public constructor(private 字段名: 字段类型) {
    super()
    this.插件 = [
      new JSON解析插件(
        z.object({
          ...构造对象(this.字段名, z.string()),
        }),
        {},
      ),
    ]
  }

  public override 获得插件们(): [JSON解析插件<z.ZodObject<{ [K in 字段类型]: z.ZodString }>>] {
    return this.插件
  }

  public override async 实现(
    参数: 合并插件结果<[JSON解析插件<z.ZodObject<{ [K in 字段类型]: z.ZodString }>>]>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<逻辑错误类型, 逻辑正确类型<字段类型>>> {
    let _log = 请求附加参数.log.extend(检查用户名.name)

    if (参数[this.字段名].includes(' ')) return new Left('用户名不能包含空格')
    if (参数[this.字段名] === '') return new Left('用户名不能为空')
    if (参数[this.字段名].length < 5) return new Left('用户名过短')
    if (参数[this.字段名].length > 20) return new Left('用户名过长')

    return new Right(构造对象(this.字段名, 参数[this.字段名]))
  }
}
