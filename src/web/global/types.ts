import { InterfaceType, InterfaceWsType } from '../../types/interface-type'

export type 元组转联合<T> = T extends any[] ? T[number] : never

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer U) => any ? U : never
type LastUnion<T> = UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer L) => any ? L : never
export type 联合转元组<T, Last = LastUnion<T>> = [T] extends [never] ? [] : [...联合转元组<Exclude<T, Last>>, Last]

export type Get_API接口路径们<A = InterfaceType> = A extends []
  ? []
  : A extends [infer x, ...infer xs]
    ? 'method' extends keyof x
      ? x['method'] extends 'get'
        ? 'path' extends keyof x
          ? [x['path'], ...Get_API接口路径们<xs>]
          : never
        : never
      : never
    : never
export type Post_API接口路径们<A = InterfaceType> = A extends []
  ? []
  : A extends [infer x, ...infer xs]
    ? 'method' extends keyof x
      ? x['method'] extends 'post'
        ? 'path' extends keyof x
          ? [x['path'], ...Post_API接口路径们<xs>]
          : never
        : never
      : never
    : never

export type 从路径获得API接口一般属性<Path, A = InterfaceType> = A extends []
  ? never
  : A extends [infer x, ...infer xs]
    ? 'path' extends keyof x
      ? x['path'] extends Path
        ? x
        : 从路径获得API接口一般属性<Path, xs>
      : never
    : never
export type 从路径获得API接口WS属性<Path, A = InterfaceWsType> = A extends []
  ? never
  : A extends [infer x, ...infer xs]
    ? 'path' extends keyof x
      ? x['path'] extends Path
        ? x
        : 从路径获得API接口WS属性<Path, xs>
      : never
    : never

export type Get请求后端函数类型 = <路径 extends 元组转联合<Get_API接口路径们>>(
  路径: 路径,
  参数: 从路径获得API接口一般属性<路径>['input'],
) => Promise<从路径获得API接口一般属性<路径>['successOutput']['data']>
export type Post请求后端函数类型 = <路径 extends 元组转联合<Post_API接口路径们>>(
  路径: 路径,
  参数: 路径 extends 元组转联合<Post_API接口路径们> ? 从路径获得API接口一般属性<路径>['input'] : never,
  ws信息回调?: (信息: 从路径获得API接口WS属性<路径>['data']) => void,
  ws关闭回调?: (信息: CloseEvent) => void,
  ws错误回调?: (信息: Event) => void,
  获得ws句柄?: (ws句柄: WebSocket) => void,
) => 路径 extends 元组转联合<Post_API接口路径们>
  ? Promise<从路径获得API接口一般属性<路径>['successOutput']['data']>
  : never
