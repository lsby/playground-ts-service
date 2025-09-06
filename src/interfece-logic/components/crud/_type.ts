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
