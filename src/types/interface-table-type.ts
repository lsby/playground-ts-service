export type InterfaceTableType = [{ 路径: "/table/user-info"; 构造参数: {}; 增参数_数据们: ({ id?: string | undefined; } & { name?: string | undefined; })[]; 删参数_筛选条件: 条件组<{ id: string; name: string; }>; 改参数_新值: Partial<{ id: string; name: string; }>; 改参数_筛选条件: 条件组<{ id: string; name: string; }>; 查参数_筛选条件: 条件组<{ id: string; name: string; }>; 查参数_分页条件: 分页选项; 查参数_排序条件: 排序选项<"id" | "name">; 增原始错误值: "不允许"; 删原始错误值: "未登录"; 改原始错误值: "未登录"; 查原始错误值: "未登录"; 增原始正确值: {}; 删原始正确值: {}; 改原始正确值: {}; 查原始正确值: { id: string; name: string; }[]; 增包装结果: { status: "fail"; data: "不允许"; } | { status: "success"; data: {}; }; 删包装结果: { status: "fail"; data: "未登录"; } | { status: "success"; data: {}; }; 改包装结果: { status: "fail"; data: "未登录"; } | { status: "success"; data: {}; }; 查包装结果: { status: "fail"; data: "未登录"; } | { status: "success"; data: { id: string; name: string; }[]; }; }]

export type 是any<T> = 0 extends 1 & T ? true : false
export type 条件<列定义> =
  是any<列定义> extends true
    ? any
    :
        | { [K in keyof 列定义]: { 列: K; 符号: '=' | '<>'; 值: 列定义[K] } }[keyof 列定义]
        | { [K in keyof 列定义]: { 列: K; 符号: 'in' | 'not in'; 值: 列定义[K][] } }[keyof 列定义]
        | { [K in keyof 列定义]: { 列: K; 符号: 'is' | 'is not'; 值: null } }[keyof 列定义]
        | {
            [K in keyof 列定义]: 列定义[K] extends string ? { 列: K; 符号: 'like' | 'not like'; 值: string } : never
          }[keyof 列定义]
        | {
            [K in keyof 列定义]: 列定义[K] extends number ? { 列: K; 符号: '>' | '<' | '>=' | '<='; 值: number } : never
          }[keyof 列定义]
export type 条件组<列定义 extends object> = 条件<列定义>[]
export type 分页选项 = {
  页数: number
  大小: number
}
export type 排序选项<列名称们> = {
  排序列: 列名称们
  排序模式: '正序' | '倒序'
}
export type 翻译自定义类型<A> = A extends '字符串'
  ? string
  : A extends '数字'
    ? number
    : A extends '布尔'
      ? boolean
      : never
export type 翻译列描述<对象> =
  是any<对象> extends true
    ? any
    : { [key in keyof 对象]: '类型' extends keyof 对象[key] ? 翻译自定义类型<对象[key]['类型']> : never }
export type 翻译查询列描述<对象> =
  是any<对象> extends true
    ? any
    : {
        [key in keyof 对象]: '类型' extends keyof 对象[key]
          ? '可空' extends keyof 对象[key]
            ? 对象[key]['可空'] extends 'false'
              ? 翻译自定义类型<对象[key]['类型']>
              : 翻译自定义类型<对象[key]['类型']> | undefined
            : never
          : never
      }
export type 翻译插入列描述<对象> =
  是any<对象> extends true
    ? any
    : 归约数组对象<
        联合转元组<
          未定义对象转可选对象<{
            [key in keyof 对象]: '类型' extends keyof 对象[key]
              ? '可选' extends keyof 对象[key]
                ? 对象[key]['可选'] extends 'false'
                  ? 翻译自定义类型<对象[key]['类型']>
                  : 翻译自定义类型<对象[key]['类型']> | undefined
                : never
              : never
          }>
        >
      >
export type 未定义对象转可选对象<X> = {
  [key in keyof X]: undefined extends X[key] ? { [k in key]?: X[key] } : { [k in key]: X[key] }
}[keyof X]

type 归约数组对象<Arr> = Arr extends [] ? {} : Arr extends [infer x, ...infer xs] ? x & 归约数组对象<xs> : never

type 联合转换成函数<X> = X extends any ? (a: (x: any) => X) => any : never
type 函数转换成与<X> = (X extends any ? X : never) extends (a: infer A) => any ? A : never
type 取最后一个<X> = 函数转换成与<联合转换成函数<X>> extends (x: any) => infer A ? A : never
type 联合转元组<X> = [X] extends [never]
  ? []
  : 取最后一个<X> extends infer Last
    ? [...联合转元组<Exclude<X, Last>>, Last]
    : never
