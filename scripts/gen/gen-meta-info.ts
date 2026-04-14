import fs from 'fs'
import path from 'path'
import { z } from 'zod'

let 包信息模式 = z.object({ version: z.string() })

let 包信息 = 包信息模式.parse(JSON.parse(fs.readFileSync('package.json', 'utf-8')))
let 版本号 = 包信息.version

let 输出路径 = path.resolve(import.meta.dirname, '../../src/app/meta-info.ts')
fs.writeFileSync(输出路径, `export let version: string = '${版本号}'\n`)
