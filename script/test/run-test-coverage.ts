import { execSync } from 'child_process'

var args = process.argv.slice(2)
var filter = args[0]

if (!filter) {
  filter = '.*'
}

var command = `cross-env DEBUG=@lsby:* lsby-net-core-gen-test ./tsconfig.json ./src/model ./test/unit-test.test.ts ${filter} && vitest run --coverage`

try {
  execSync(command, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
