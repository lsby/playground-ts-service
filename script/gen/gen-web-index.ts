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
    } else if (stat && stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      const relativePath = path
        .relative(baseDir, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.(ts|tsx)$/, '')
      results.push(relativePath)
    }
  }

  return results
}

const folderPath = 'src/web/components'
const code = getAllTSFiles(folderPath)
  .filter((a) => a !== 'index')
  .map((a) => `export * from './${a}'`)
const newContent = [`// 该文件由脚本自动生成, 请勿修改.`, ...code, ''].join('\n')

const targetFile = 'src/web/components/index.ts'
let existingContent = ''
try {
  existingContent = fs.readFileSync(targetFile, 'utf-8')
} catch (error) {
  // 文件不存在时，existingContent 为空字符串
}

if (existingContent !== newContent) {
  fs.writeFileSync(targetFile, newContent)
  console.log(`文件 ${targetFile} 已更新。`)
} else {
  console.log(`文件 ${targetFile} 内容未变化，跳过写入。`)
}
