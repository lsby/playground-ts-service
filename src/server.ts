#!/usr/bin/env node
import { App } from './app/app'
import { init } from './init/init'
import { 启动异常兜底 } from './tools/fallback'

async function main(): Promise<void> {
  启动异常兜底()
  await init()
  await new App().run()
}
main().catch(console.error)
