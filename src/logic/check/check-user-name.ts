import { JSON解析插件, 合并插件结果, 接口逻辑, 请求附加参数类型 } from '@lsby/net-core'
import { Either, Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { 构造元组, 构造对象 } from '../../types'

type 验证值描述<检查名称 extends string> = Record<检查名称, z.ZodString>
type 验证对象描述<检查名称 extends string> = z.ZodObject<验证值描述<检查名称>>
type 验证对象类型<检查名称 extends string> = z.infer<验证对象描述<检查名称>>

function 逻辑插件<检查名称 extends string>(检查名称值: 检查名称): 逻辑插件类型<检查名称> {
  return 构造元组([new Task(async () => new JSON解析插件(z.object({ ...构造对象(检查名称值, z.string()) }), {}))])
}

type 逻辑插件类型<检查名称 extends string> = [Task<JSON解析插件<验证对象描述<检查名称>>>]
type 逻辑参数类型<检查名称 extends string> = 合并插件结果<逻辑插件类型<检查名称>>
type 逻辑附加参数类型 = {}

type 逻辑错误类型 = '用户名不能包含空格' | '用户名不能为空' | '用户名过短' | '用户名过长'
type 逻辑正确类型<检查名称 extends string> = 验证对象类型<检查名称>

class 逻辑实现<检查名称 extends string> extends 接口逻辑<
  逻辑插件类型<检查名称>,
  逻辑附加参数类型,
  逻辑错误类型,
  逻辑正确类型<检查名称>
> {
  constructor(private 检查名称值: 检查名称) {
    super()
  }

  override 获得插件们(): 逻辑插件类型<检查名称> {
    return 逻辑插件(this.检查名称值)
  }

  override async 实现(
    参数: 逻辑参数类型<检查名称>,
    逻辑附加参数: 逻辑附加参数类型,
    请求附加参数: 请求附加参数类型,
  ): Promise<Either<逻辑错误类型, 逻辑正确类型<检查名称>>> {
    let _log = 请求附加参数.log.extend('登录检查器')
    if (参数[this.检查名称值].includes(' ')) return new Left('用户名不能包含空格')
    if (参数[this.检查名称值] === '') return new Left('用户名不能为空')
    if (参数[this.检查名称值].length < 5) return new Left('用户名过短')
    if (参数[this.检查名称值].length > 20) return new Left('用户名过长')
    return new Right(参数)
  }
}

export let 检查用户名 = 逻辑实现
