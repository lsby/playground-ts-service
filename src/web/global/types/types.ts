import { InterfaceType } from '../../../types/interface-type'

export type 获得对象属性<A, p extends string> = A extends infer X ? (p extends keyof X ? X[p] : never) : never

export type 所有接口路径 = InterfaceType[number]['path']
export type 不安全的通过路径获得接口定义<P, A = InterfaceType, Result = never> = A extends [infer First, ...infer Rest]
  ? First extends { path: infer Path }
    ? P extends Path
      ? 不安全的通过路径获得接口定义<P, Rest, First>
      : 不安全的通过路径获得接口定义<P, Rest, Result>
    : 不安全的通过路径获得接口定义<P, Rest, Result>
  : Result
export type 通过路径获得接口定义<
  P extends 所有接口路径,
  A = InterfaceType,
  Result = never,
> = 不安全的通过路径获得接口定义<P, A, Result>
