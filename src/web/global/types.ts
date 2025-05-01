import { InterfaceType } from '../../types/interface-type'

export type 元组转联合<T> = T extends any[] ? T[number] : never

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer U) => any ? U : never
type LastUnion<T> = UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer L) => any ? L : never
export type 联合转元组<T, Last = LastUnion<T>> = [T] extends [never] ? [] : [...联合转元组<Exclude<T, Last>>, Last]
export type 获得对象属性<A, p extends string> = A extends infer X ? (p extends keyof X ? X[p] : never) : never

export type 所有接口路径 = InterfaceType[number]['path']
export type 通过路径获得接口定义<P, A = InterfaceType, Result = never> = A extends [infer First, ...infer Rest]
  ? First extends { path: infer Path }
    ? P extends Path
      ? 通过路径获得接口定义<P, Rest, First>
      : 通过路径获得接口定义<P, Rest, Result>
    : 通过路径获得接口定义<P, Rest, Result>
  : Result
