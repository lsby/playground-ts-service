#!/usr/bin/env node
import { App } from './app/app'

// var kysely = await Global.getItem('kysely')
// await kysely
//   .获得句柄()
//   .insertInto('user')
//   .values({
//     id: randomUUID(),
//     name: 'admin',
//     pwd: '123456',
//   })
//   .execute()

new App().run().catch(console.error)
