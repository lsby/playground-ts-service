import { app } from '../src/app/app'

async function main(): Promise<void> {
  await app.run()
}
main().catch(console.error)
