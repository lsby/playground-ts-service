import { execSync } from 'child_process'

let 参数 = process.argv.slice(2)
let 过滤器 = 参数[0]

if (过滤器 === undefined || 过滤器.length === 0) {
  过滤器 = '.*'
}

let 命令 = `lsby-net-core-gen-test ./tsconfig.json ./src/interface ./test/unit-test.test.ts ${过滤器} && vitest run`

try {
  execSync(命令, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
