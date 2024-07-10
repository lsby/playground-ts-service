import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { Kysely管理器 } from '../model/kysely'
import { DB } from '../types/db'

var zod类型 = z.custom<Kysely管理器<DB>>((a) => a instanceof Kysely管理器)

var 结果类型 = z.object({ kysely: zod类型 })

export class Kysely插件 extends 插件<typeof 结果类型> {
  constructor(kysely: Kysely管理器<DB>) {
    super(结果类型, () => new Task(async () => ({ kysely })))
  }
}
