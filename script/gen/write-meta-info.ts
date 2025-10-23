import fs from 'fs'
import path from 'path'

const 包信息 = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const 版本号 = 包信息.version

const 输出路径 = path.resolve(import.meta.dirname, '../../src/app/meta-info.ts')
fs.writeFileSync(输出路径, `export let version: string = '${版本号}'\n`)
