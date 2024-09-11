import { Kysely } from 'kysely'
import { Either, Left } from '@lsby/ts-fp-data'
import { Log } from '@lsby/ts-log'
import { Global } from '../../global/global'
import { DB } from '../../types/db'

export const 兜底错误 = '未知错误' as const
export type 业务行为错误类型 = typeof 兜底错误 | string
export type 业务行为参数类型 = Record<string, any>
export type 业务行为返回类型 = Record<string, any>
export type 业务行为实现上下文 = {
  kesely: Kysely<DB>
  log: Log
}
type 任意业务行为 = 业务行为<any, any, any>
type 计算混合组合<
  A参数类型,
  A错误类型 extends 业务行为错误类型,
  A返回类型 extends 业务行为返回类型,
  B参数类型,
  B错误类型 extends 业务行为错误类型,
  B返回类型 extends 业务行为返回类型,
> = 业务行为<A参数类型 & Omit<B参数类型, keyof A返回类型>, A错误类型 | B错误类型, A返回类型 & B返回类型>
type 计算混合单一组合<A, B> =
  A extends 业务行为<infer A参数, infer A错误, infer A返回>
    ? B extends 业务行为<infer B参数, infer B错误, infer B返回>
      ? 计算混合组合<A参数, A错误, A返回, B参数, B错误, B返回>
      : never
    : never
type 计算混合组合数组<Arr> = Arr extends [infer x, infer y]
  ? 计算混合单一组合<x, y>
  : Arr extends [infer x, infer y, ...infer s]
    ? 计算混合组合数组<[计算混合单一组合<x, y>, ...s]>
    : never

/**
 * ## 业务行为
 *
 * 业务行为是代码中业务逻辑的抽象表示
 * 其本质是一个执行特定业务逻辑的函数
 * 其特点是:
 * - 业务相关: 比起普通函数, 特化了一部分逻辑, 以更好的适应业务逻辑的需要
 * - 类型安全: 遵循 先类型 后实现 的原则
 * - 数据库原子性: 无需关注数据库事务, 当发生错误时数据库操作会自动回滚
 * - 可组合: 基于该模型, 可以创建出各种具有想象力的组合模式
 *
 * ## 实现
 *
 * 对于业务行为而言, 至少应该明确:
 * - 参数: 该函数需要的信息
 * - 错误: 该函数可能发生的错误
 * - 返回: 该函数正确执行时返回的数据
 *
 * 当编写一个业务行为时, 必须先明确以上三者的类型, 然后继承该基类进行实现
 *
 * 实现中, 可以获得:
 * - 数据库句柄
 * - 参数
 *
 * 必须返回一个左值或一个右值, 当然也可能意外的抛出错误
 * 如果返回左值或发生异常, 数据库操作会自动回滚
 * 当意外的抛出错误时, 将返回兜底错误
 *
 * ## 组合
 *
 * 可以将业务逻辑进行组合, 创造出新的业务逻辑
 *
 * ## 使用
 *
 * 通过`运行业务行为`来执行该业务行为
 * 这将会得到实现中返回的结果
 */
export abstract class 业务行为<
  参数类型 extends 业务行为参数类型,
  错误类型 extends 业务行为错误类型,
  返回类型 extends 业务行为返回类型,
> {
  // ================================= 静态 =================================
  static 通过实现构造<
    参数类型 extends 业务行为参数类型,
    错误类型 extends 业务行为错误类型,
    返回类型 extends 业务行为返回类型,
  >(
    实现: (上下文: 业务行为实现上下文, 参数: 参数类型) => Promise<Either<错误类型, 返回类型>>,
    业务行为名称?: string,
  ): 业务行为<参数类型, 错误类型, 返回类型> {
    return new (class extends 业务行为<参数类型, 错误类型, 返回类型> {
      protected override async 业务行为实现(
        上下文: 业务行为实现上下文,
        参数: 参数类型,
      ): Promise<Either<错误类型, 返回类型>> {
        return 实现(上下文, 参数)
      }
    })(业务行为名称)
  }

  /**
   * 将两个模型串接, 得到一个新模型, 新模型的类型是:
   * - 参数: a模型的参数
   * - 错误: a模型的错误+b模型的错误
   * - 返回值: b模型的返回值
   */
  static 流式组合<
    A参数类型 extends 业务行为参数类型,
    A错误类型 extends 业务行为错误类型,
    A返回类型 extends 业务行为返回类型,
    B错误类型 extends 业务行为错误类型,
    B返回类型 extends 业务行为返回类型,
  >(
    a: 业务行为<A参数类型, A错误类型, A返回类型>,
    b: 业务行为<A返回类型, B错误类型, B返回类型>,
  ): 业务行为<A参数类型, A错误类型 | B错误类型, B返回类型> {
    return a.流式组合(b)
  }
  /**
   * 将两个模型串接, 得到一个新的模型
   * 相比流式组合, 本函数不要求串联位置参数匹配, 缺少的参数将在调用时补全
   * 新模型的类型是:
   * - 参数: a模型的参数+(b模型的参数-a模型的返回值)
   * - 错误: a模型的错误+b模型的错误
   * - 返回值: a模型的返回值+b模型的返回值
   */
  static 混合组合<
    A参数类型 extends 业务行为参数类型,
    A错误类型 extends 业务行为错误类型,
    A返回类型 extends 业务行为返回类型,
    B参数类型 extends 业务行为参数类型,
    B错误类型 extends 业务行为错误类型,
    B返回类型 extends 业务行为返回类型,
  >(
    a: 业务行为<A参数类型, A错误类型, A返回类型>,
    b: 业务行为<B参数类型, B错误类型, B返回类型>,
  ): 计算混合组合<A参数类型, A错误类型, A返回类型, B参数类型, B错误类型, B返回类型> {
    return a.混合组合(b)
  }
  /**
   * 针对多个项混合组合
   */
  static 混合组合多项<A extends 任意业务行为[]>(arr: [...A]): 计算混合组合数组<A> {
    return arr.reduce((s, a) => s.混合组合(a)) as any
  }

  // ================================= 私有 =================================
  private 业务行为名称: string
  constructor(业务行为名称?: string) {
    if (!业务行为名称) this.业务行为名称 = this.constructor.name || '<匿名>'
    else this.业务行为名称 = 业务行为名称
  }

  protected abstract 业务行为实现(上下文: 业务行为实现上下文, 参数: 参数类型): Promise<Either<错误类型, 返回类型>>

  private async 非事务的运行业务行为(上下文: 业务行为实现上下文, 参数: 参数类型): Promise<Either<错误类型, 返回类型>> {
    return await this.业务行为实现(上下文, 参数)
  }

  // ================================= 公开 =================================
  设置业务行为名称(业务行为名称: string): this {
    this.业务行为名称 = 业务行为名称
    return this
  }

  async 运行业务行为(kysely: Kysely<DB>, 参数: 参数类型): Promise<Either<错误类型, 返回类型>> {
    var log = (await Global.getItem('log')).extend(this.业务行为名称)
    try {
      var r: Either<错误类型, 返回类型>
      if (!kysely.isTransaction) {
        r = await kysely.connection().execute(async (db) => {
          return db.transaction().execute(async (trx) => {
            const c = await this.业务行为实现({ kesely: trx, log }, 参数)
            if (c.isLeft()) throw c
            return c
          })
        })
      } else {
        r = await this.业务行为实现({ kesely: kysely, log }, 参数)
      }
      return r
    } catch (e) {
      if (e instanceof Either) return e
      else {
        await log.err('业务行为发生非预期的异常: %O', e)
        return new Left(兜底错误 as 错误类型)
      }
    }
  }

  // ================================= 组合 =================================
  流式组合<B错误类型 extends 业务行为错误类型, B返回类型 extends 业务行为返回类型>(
    b: 业务行为<返回类型, B错误类型, B返回类型>,
  ): 业务行为<参数类型, 错误类型 | B错误类型, B返回类型> {
    return 业务行为.通过实现构造(async (kesely, 参数): Promise<Either<错误类型 | B错误类型, B返回类型>> => {
      const 我的结果 = await this.非事务的运行业务行为(kesely, 参数)
      if (我的结果.isLeft()) return new Left(我的结果.assertLeft().getLeft())
      return b.非事务的运行业务行为(kesely, 我的结果.assertRight().getRight())
    }, `流式组合(${this.业务行为名称}, ${b.业务行为名称})`)
  }
  混合组合<B参数类型 extends 业务行为参数类型, B错误类型 extends 业务行为错误类型, B返回类型 extends 业务行为返回类型>(
    b: 业务行为<B参数类型, B错误类型, B返回类型>,
  ): 计算混合组合<参数类型, 错误类型, 返回类型, B参数类型, B错误类型, B返回类型> {
    return 业务行为.通过实现构造(async (kesely, 参数): Promise<Either<错误类型 | B错误类型, 返回类型 & B返回类型>> => {
      const 我的结果 = await this.非事务的运行业务行为(kesely, 参数)
      if (我的结果.isLeft()) return new Left(我的结果.assertLeft().getLeft())
      var 对方结果 = await b.非事务的运行业务行为(kesely, { ...参数, ...我的结果.assertRight().getRight() } as any)
      return 对方结果.map((a) => Object.assign(a, 我的结果.assertRight().getRight()))
    }, `混合组合(${this.业务行为名称}, ${b.业务行为名称})`)
  }

  // ================================= 映射 =================================
  映射结果<新返回类型 extends 业务行为返回类型>(
    f: (a: 返回类型) => 新返回类型,
  ): 业务行为<参数类型, 错误类型, 新返回类型> {
    return 业务行为.通过实现构造(async (kesely, 参数) => {
      const 我的结果 = await this.非事务的运行业务行为(kesely, 参数)
      if (我的结果.isLeft()) return new Left(我的结果.assertLeft().getLeft())
      return Either.pure(f(我的结果.assertRight().getRight()))
    }, this.业务行为名称)
  }
  映射错误<新错误类型 extends 业务行为错误类型>(
    f: (a: 错误类型) => 新错误类型,
  ): 业务行为<参数类型, 新错误类型, 返回类型> {
    return 业务行为.通过实现构造(async (kesely, 参数) => {
      const 我的结果 = await this.非事务的运行业务行为(kesely, 参数)
      if (我的结果.isLeft()) return new Left(f(我的结果.assertLeft().getLeft()))
      return Either.pure(我的结果.assertRight().getRight())
    }, this.业务行为名称)
  }
}
