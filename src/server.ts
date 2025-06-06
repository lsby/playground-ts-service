#!/usr/bin/env node
import { App } from './app/app'
import { init } from './init/init'

await init()
new App().run().catch(console.error)
