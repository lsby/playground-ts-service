type 匹配重载<T> = T extends {
  (...a: infer A1): infer R1
  (...a: infer A2): infer R2
  (...a: infer A3): infer R3
  (...a: infer A4): infer R4
  (...a: infer A5): infer R5
  (...a: infer A6): infer R6
  (...a: infer A7): infer R7
  (...a: infer A8): infer R8
  (...a: infer A9): infer R9
}
  ? [
      (...a: A1) => R1,
      (...a: A2) => R2,
      (...a: A3) => R3,
      (...a: A4) => R4,
      (...a: A5) => R5,
      (...a: A6) => R6,
      (...a: A6) => R6,
      (...a: A7) => R7,
      (...a: A8) => R8,
      (...a: A9) => R9,
    ]
  : never
type 删除重复<T extends any[]> = T extends [infer x, ...infer xs]
  ? x extends xs[number]
    ? 删除重复<xs>
    : [x, ...删除重复<xs>]
  : []
export type 计算函数所有重载<T> = 删除重复<匹配重载<T>>

export type 元组转联合<T> = T extends any[] ? T[number] : never

export type Eq<A, B> = A extends B ? (B extends A ? true : false) : false
export type 去除只读<T> = T extends readonly [...infer U] ? U : never

export function 构造元组<T extends any[]>(args: [...T]): T {
  return args
}
export function 构造对象<K extends string, V>(key: K, value: V): { [P in K]: V} {
  return { [key]: value } as any
}
