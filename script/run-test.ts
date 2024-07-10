import { execSync } from 'child_process'

const args = process.argv.slice(2)
let filter = args[0]

if (!filter) {
  filter = '.*'
}

const command = `npm run test:gen -- ${filter} && ts-mocha -n import=tsx --no-timeout --colors --exit --bail test/unit-test.ts`

try {
  execSync(command, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
