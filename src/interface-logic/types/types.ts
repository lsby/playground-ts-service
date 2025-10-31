import { Kysely插件 } from '@lsby/net-core-kysely'
import { ColumnType } from 'kysely'

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
