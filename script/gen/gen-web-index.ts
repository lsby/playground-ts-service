import * as fs from 'fs'
import * as path from 'path'

function getAllTSFiles(dir: string, baseDir: string = dir): string[] {
  let results: string[] = []

  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTSFiles(fullPath, baseDir))
    } else if (stat && stat.isFile() && fullPath.endsWith('.ts')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/').replace(/\.ts$/, '')
      results.push(relativePath)
    }
  }

  return results
}

const folderPath = 'src/web/components'
const code = getAllTSFiles(folderPath)
  .filter((a) => a !== 'index')
  .map((a) => `export * from './${a}'`)
fs.writeFileSync('src/web/components/index.ts', [`// 该文件由脚本自动生成, 请勿修改.`, ...code, ''].join('\n'))
