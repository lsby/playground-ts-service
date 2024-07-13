import type { z } from 'zod'
import { 合并插件结果, 接口类型, 插件 } from '@lsby/net-core'

type 取值<A> = A extends Promise<插件<infer x>> ? x : never
type 合并JSON插件结果<Arr extends Array<Promise<插件<z.AnyZodObject>>>> = Arr extends []
  ? {}
  : Arr extends [infer x, ...infer xs]
    ? x extends infer obj
      ? xs extends Array<Promise<插件<z.AnyZodObject>>>
        ? 'body' extends keyof z.infer<取值<obj>>
          ? z.infer<取值<obj>>['body'] & 合并插件结果<xs>
          : {}
        : {}
      : {}
    : {}

type 获得接口的插件<接口类型描述> = 接口类型描述 extends 接口类型<any, any, infer PreApis, any, any> ? PreApis : never

export type 从接口类型获得接口JSON参数<接口类型描述> = 合并JSON插件结果<获得接口的插件<接口类型描述>>
