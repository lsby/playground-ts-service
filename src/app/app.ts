#!/usr/bin/env node
import { 服务器 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalEnv, GlobalLog } from '../global/global'
import add from '../interface/add'
import sub from '../interface/sub'

export var app = new Task(async () => {
  var log = (await GlobalLog.getInstance().run()).extend('service')
  var env = await GlobalEnv.getInstance().run()

  const 服务器地址 = (await new 服务器([add, sub], env.APP_PORT).run().run()).ip
  await log.debug('服务器地址: %O', 服务器地址).run()
})
