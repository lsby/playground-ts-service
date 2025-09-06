export type 条件<表结构> =
  | {
      字段: keyof 表结构
      操作符: '=' | '!=' | '>' | '>=' | '<' | '<='
      值: 表结构[keyof 表结构]
    }
  | {
      字段: keyof {
        [K in keyof 表结构 as 表结构[K] extends string ? K : never]: 表结构[K]
      }
      操作符: 'like'
      值: string
    }
  | {
      字段: keyof 表结构
      操作符: 'in'
      值: 表结构[keyof 表结构][]
    }
  | {
      字段: keyof 表结构
      操作符: 'between'
      值: [表结构[keyof 表结构], 表结构[keyof 表结构]]
    }
