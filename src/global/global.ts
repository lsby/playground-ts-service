import { z } from 'zod'
import { Task } from '@lsby/ts-fp-data'
import { 环境变量管理器 } from '../tools/env'
import { GetProName } from '../tools/get-pro-name'
import { Log } from '../tools/log'

var 环境变量描述 = z.object({
  APP_PORT: z.coerce.number(),
})

export class GlobalEnv {
  private static instance: 环境变量管理器<typeof 环境变量描述>
  public static getInstance(): Task<z.infer<typeof 环境变量描述>> {
    if (!GlobalEnv.instance) GlobalEnv.instance = new 环境变量管理器(环境变量描述)
    return GlobalEnv.instance.获得环境变量()
  }

  private constructor() {}
}

export class GlobalLog {
  private static instance: Log
  public static getInstance(): Task<Log> {
    return GlobalGetProName.getInstance()
      .getProName()
      .map((name) => {
        name = name.replaceAll('/', ':')
        if (!GlobalLog.instance) GlobalLog.instance = new Log(name)
        return GlobalLog.instance
      })
  }

  private constructor() {}
}

export class GlobalGetProName {
  private static instance: GetProName
  public static getInstance(): GetProName {
    if (!GlobalGetProName.instance) GlobalGetProName.instance = new GetProName()
    return GlobalGetProName.instance
  }

  private constructor() {}
}
