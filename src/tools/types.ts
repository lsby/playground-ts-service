import { Kysely插件 } from '@lsby/net-core-kysely'
import { ColumnType } from 'kysely'

// kysely辅助
type 等值操作符 = '=' | '!=' | '>' | '>=' | '<' | '<='
type 等值条件<表结构> = [字段: keyof 表结构, 操作符: 等值操作符, 值: 表结构[keyof 表结构]]
type Like条件<表结构> = [
  字段: keyof { [K in keyof 表结构 as 表结构[K] extends string ? K : never]: 表结构[K] },
  操作符: 'like',
  值: string,
]
type In条件<表结构> = [字段: keyof 表结构, 操作符: 'in', 值: 表结构[keyof 表结构][]]
type Between条件<表结构> = [字段: keyof 表结构, 操作符: 'between', 值: [表结构[keyof 表结构], 表结构[keyof 表结构]]]
export type 条件<表结构> = 等值条件<表结构> | Like条件<表结构> | In条件<表结构> | Between条件<表结构>
export type 从插件类型计算DB<插件类型> = 插件类型 extends Kysely插件<'kysely', infer x> ? x : never

type 展开ColumnType<T, Mode extends '__select__' | '__insert__' | '__update__'> =
  T extends ColumnType<any, any, any> ? T[Mode] : T
export type 替换ColumnType<T, Mode extends '__select__' | '__insert__' | '__update__'> = {
  [K in keyof T]: 展开ColumnType<T[K], Mode>
}

type 包含undefined<T> = undefined extends T ? true : false
export type undefined加可选<T> = {
  [K in keyof T as 包含undefined<T[K]> extends true ? K : never]?: Exclude<T[K], undefined>
} & {
  [K in keyof T as 包含undefined<T[K]> extends true ? never : K]: T[K]
}

// 常用类型计算
type 联合转交叉<T> = (T extends any ? (x: T) => any : never) extends (x: infer U) => any ? U : never
type 取最后的联合<T> = 联合转交叉<T extends any ? (x: T) => any : never> extends (x: infer L) => any ? L : never
export type 联合转元组<T, Last = 取最后的联合<T>> = [T] extends [never] ? [] : [...联合转元组<Exclude<T, Last>>, Last]
export type 元组转联合<T> = T extends any[] ? T[number] : never

/**
 * 用于标记经过人工审查过的 any 类型
 *
 * @description
 * 仅在开发者确认使用 any 是合理的, 且不会导致污染或逃逸到外部时使用.
 * 常用于开发者确定某赋值是正确的, 但无法或很难给 ts 证明时.
 *
 * **使用时务必谨慎**
 */
export type 已审阅的any = any
