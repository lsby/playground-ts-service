#!/usr/bin/env node
import { App } from './app/app'
import { init } from './init/init'

async function main(): Promise<void> {
  await init()
  await new App().run()
}
main().catch(console.error)
