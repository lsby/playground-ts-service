import fs from 'fs'
import path from 'path'

let 包信息 = JSON.parse(fs.readFileSync('package.json', 'utf-8')) as { version: string }
let 版本号 = 包信息.version

let 输出路径 = path.resolve(import.meta.dirname, '../../src/app/meta-info.ts')
fs.writeFileSync(输出路径, `export let version: string = '${版本号}'\n`)
