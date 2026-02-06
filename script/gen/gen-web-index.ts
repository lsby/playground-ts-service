import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

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

function isComponentSubclass(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false
  const source = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
  let hasComponentSubclass = false

  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node) && node.name) {
      // 检查是否导出
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) || false
      // 检查继承
      if (node.heritageClauses && isExported) {
        for (const clause of node.heritageClauses) {
          if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const type of clause.types) {
              if (ts.isIdentifier(type.expression) && type.expression.text === '组件基类') {
                hasComponentSubclass = true
                return
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return hasComponentSubclass
}

const folderPath = 'src/web/components'
const code = getAllTSFiles(folderPath)
  .filter(
    (a) =>
      a !== 'index' &&
      (isComponentSubclass(path.join(folderPath, a + '.ts')) || isComponentSubclass(path.join(folderPath, a + '.tsx'))),
  )
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
