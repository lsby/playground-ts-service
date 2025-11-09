type 联合转交叉<T> = (T extends any ? (x: T) => any : never) extends (x: infer U) => any ? U : never
type 取最后的联合<T> = 联合转交叉<T extends any ? (x: T) => any : never> extends (x: infer L) => any ? L : never
export type 联合转元组<T, Last = 取最后的联合<T>> = [T] extends [never] ? [] : [...联合转元组<Exclude<T, Last>>, Last]
export type 元组转联合<T> = T extends any[] ? T[number] : never

type _计算对象严格键类型<obj, k> = k extends []
  ? []
  : k extends [infer x, ...infer xs]
    ? x extends keyof obj
      ? [x, ..._计算对象严格键类型<obj, xs>]
      : never
    : never
type 计算对象严格键类型<T> = _计算对象严格键类型<T, 联合转元组<keyof T>>
export function 长度敏感的keys<T extends object>(obj: T): 计算对象严格键类型<T> {
  return Object.keys(obj) as 计算对象严格键类型<T>
}

type _计算对象严格值类型<obj, k> = k extends []
  ? []
  : k extends [infer x, ...infer xs]
    ? x extends keyof obj
      ? [obj[x], ..._计算对象严格值类型<obj, xs>]
      : never
    : never
type 计算对象严格值类型<T> = _计算对象严格值类型<T, 联合转元组<keyof T>>
export function 长度敏感的values<T extends object>(obj: T): 计算对象严格值类型<T> {
  return Object.values(obj) as 计算对象严格值类型<T>
}
export function 长度敏感的map<T extends readonly any[], R>(
  tuple: T,
  fn: (item: T[number], index: number) => R,
): { [K in keyof T]: R } {
  return tuple.map(fn) as { [K in keyof T]: R }
}

export function 严格keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}
export function 严格values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}
export function 严格entries<T extends object>(
  obj: T,
): {
  [K in keyof T]-?: [K, NonNullable<T[K]>]
}[keyof T][] {
  return Object.entries(obj) as any
}
export function 严格forEach<T extends object>(obj: T, 回调: <K extends keyof T>(key: K, value: T[K]) => void): void {
  ;(Object.keys(obj) as (keyof T)[]).forEach((k) => {
    let v = obj[k]
    回调(k, v)
  })
}
export function 严格map<T, R>(arr: readonly T[], fn: (a: T) => R): 联合转元组<R> {
  return arr.map(fn) as any
}

export function 对象map<T extends Record<string, any>, U>(
  输入对象: T,
  映射函数: (值: T[keyof T], 键: keyof T, 原对象: T) => U,
): { [K in keyof T]: U } {
  let 结果: Partial<{ [K in keyof T]: U }> = {}
  for (let 键 in 输入对象) {
    if (Object.prototype.hasOwnProperty.call(输入对象, 键)) {
      let 值 = 输入对象[键]
      结果[键] = 映射函数(值, 键, 输入对象)
    }
  }
  return 结果 as { [K in keyof T]: U }
}

export async function 异步forEach<T>(
  arr: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void> | void,
): Promise<void> {
  for (let i = 0; i < arr.length; i++) {
    await callback(arr[i] as any, i, arr)
  }
}
export async function 异步map<T, U>(
  arr: T[],
  callback: (item: T, index: number, array: T[]) => Promise<U> | U,
): Promise<U[]> {
  let 结果: U[] = []
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i]
    if (item === void 0) throw new Error('意外的数组越界')
    let 值 = await callback(item, i, arr)
    结果.push(值)
  }
  return 结果
}

export function 数组去重<T>(原数组: T[]): T[] {
  return Array.from(new Set(原数组))
}

type Zip严格<A extends any[], B extends any[]> = A extends [infer AHead, ...infer ARest]
  ? B extends [infer BHead, ...infer BRest]
    ? [[AHead, BHead], ...Zip严格<ARest, BRest>] // 递归
    : [] // 如果B长度不够，返回空
  : [] // A空了就结束
export function 严格zip<A extends any[], B extends any[]>(数组1: [...A], 数组2: [...B]): Zip严格<A, B> {
  if (数组1.length !== 数组2.length) {
    throw new Error('数组长度不匹配')
  }

  let 结果 = [] as unknown as Zip严格<A, B>

  for (let i = 0; i < 数组1.length; i++) {
    let 元素1 = 数组1[i]
    let 元素2 = 数组2[i]

    if (元素1 === void 0 || 元素2 === void 0) {
      throw new Error('意外的数组越界')
    }

    // TS 不知道具体索引类型，所以这里断言成 Zip 严格类型
    ;(结果 as any).push([元素1, 元素2])
  }

  return 结果
}

export type 去除只读<对象> = {
  -readonly [键 in keyof 对象]: 对象[键]
}
