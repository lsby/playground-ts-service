import { InterfaceType, InterfaceWsType } from '../../types/interface-api-type'
import { InterfaceTableType } from '../../types/interface-table-type'

export type 元组转联合<T> = T extends any[] ? T[number] : never

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

export type 所有表接口路径们<A = InterfaceTableType> = A extends []
  ? []
  : A extends [infer x, ...infer xs]
    ? '路径' extends keyof x
      ? [x['路径'], ...所有表接口路径们<xs>]
      : never
    : never
type _所有表接口路径对应API路径 = {
  [key in 元组转联合<所有表接口路径们>]: `${key}/add` | `${key}/del` | `${key}/set` | `${key}/get`
}
type 所有表接口路径对应API路径 = _所有表接口路径对应API路径[keyof _所有表接口路径对应API路径]
export type 从路径获得表接口构造参数<路径, T = InterfaceTableType> = T extends []
  ? never
  : T extends [infer x, ...infer xs]
    ? '路径' extends keyof x
      ? x['路径'] extends 路径
        ? '构造参数' extends keyof x
          ? x['构造参数']
          : never
        : 从路径获得表接口构造参数<路径, xs>
      : never
    : never
export type 从路径获得表接口属性<路径, T = InterfaceTableType> = T extends []
  ? never
  : T extends [infer x, ...infer xs]
    ? '路径' extends keyof x
      ? x['路径'] extends 路径
        ? x
        : never
      : 从路径获得表接口属性<路径, xs>
    : never

export type Get请求后端函数类型 = <路径 extends 元组转联合<Get_API接口路径们>>(
  路径: 路径,
  参数: 从路径获得API接口一般属性<路径>['input'],
) => Promise<从路径获得API接口一般属性<路径>['errorOutput'] | 从路径获得API接口一般属性<路径>['successOutput']>
export type Post请求后端函数类型 = <路径 extends 元组转联合<Post_API接口路径们> | 所有表接口路径对应API路径>(
  路径: 路径,
  参数: 路径 extends 元组转联合<Post_API接口路径们>
    ? 从路径获得API接口一般属性<路径>['input']
    : 路径 extends 所有表接口路径对应API路径
      ? 路径 extends `${infer 资源路径}/add`
        ? {
            construction: 从路径获得表接口构造参数<资源路径>
            value: 从路径获得表接口属性<资源路径>['增参数_数据们']
          }
        : 路径 extends `${infer 资源路径}/del`
          ? {
              construction: 从路径获得表接口构造参数<资源路径>
              where: 从路径获得表接口属性<资源路径>['删参数_筛选条件']
            }
          : 路径 extends `${infer 资源路径}/set`
            ? {
                construction: 从路径获得表接口构造参数<资源路径>
                value: 从路径获得表接口属性<资源路径>['改参数_新值']
                where: 从路径获得表接口属性<资源路径>['改参数_筛选条件']
              }
            : 路径 extends `${infer 资源路径}/get`
              ? {
                  construction: 从路径获得表接口构造参数<资源路径>
                  where?: 从路径获得表接口属性<资源路径>['查参数_筛选条件']
                  page?: 从路径获得表接口属性<资源路径>['查参数_分页条件']
                  sort?: 从路径获得表接口属性<资源路径>['查参数_排序条件']
                }
              : never
      : never,
  ws信息回调?: (信息: 从路径获得API接口WS属性<路径>['data']) => void,
  ws关闭回调?: (信息: CloseEvent) => void,
  ws错误回调?: (信息: Event) => void,
) => 路径 extends 元组转联合<Post_API接口路径们>
  ? Promise<从路径获得API接口一般属性<路径>['errorOutput'] | 从路径获得API接口一般属性<路径>['successOutput']>
  : 路径 extends 所有表接口路径对应API路径
    ? 路径 extends `${infer 资源路径}/add`
      ? Promise<从路径获得表接口属性<资源路径>['增包装结果']>
      : 路径 extends `${infer 资源路径}/del`
        ? Promise<从路径获得表接口属性<资源路径>['删包装结果']>
        : 路径 extends `${infer 资源路径}/set`
          ? Promise<从路径获得表接口属性<资源路径>['改包装结果']>
          : 路径 extends `${infer 资源路径}/get`
            ? Promise<从路径获得表接口属性<资源路径>['查包装结果']>
            : never
    : never
