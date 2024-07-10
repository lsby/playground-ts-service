import { execSync } from 'child_process'

var args = process.argv.slice(2)
var filter = args[0]

if (!filter) {
  filter = '.*'
}

var command = `npm run test:gen -- ${filter} && ts-mocha -n import=tsx --no-timeout --colors --exit --bail test/unit-test.ts`

try {
  execSync(command, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
