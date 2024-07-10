import type { z } from 'zod'
import { JSON解析插件, 合并插件结果, 接口类型, 插件 } from '@lsby/net-core'

type 合并JSON插件结果<Arr extends Array<插件<z.AnyZodObject>>> = Arr extends []
  ? {}
  : Arr extends [infer x, ...infer xs]
    ? x extends JSON解析插件<infer obj>
      ? xs extends Array<插件<z.AnyZodObject>>
        ? 'body' extends keyof z.infer<obj>
          ? z.infer<obj>['body'] & 合并插件结果<xs>
          : {}
        : {}
      : {}
    : {}

type 获得接口的插件<接口类型描述> = 接口类型描述 extends 接口类型<any, any, infer PreApis, any, any> ? PreApis : never

export type 从接口类型获得接口JSON参数<接口类型描述> = 合并JSON插件结果<获得接口的插件<接口类型描述>>
