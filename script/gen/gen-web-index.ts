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

type 类信息 = { 类名: string; 基类名: string | null; 是否导出: boolean }

let 所有类: Map<string, 类信息[]> = new Map()

function 解析文件(文件路径: string): void {
  if (!fs.existsSync(文件路径)) return
  const 源码 = fs.readFileSync(文件路径, 'utf-8')
  const 源文件 = ts.createSourceFile(文件路径, 源码, ts.ScriptTarget.Latest, true)
  let 文件内类: 类信息[] = []

  function 遍历(节点: ts.Node): void {
    if (ts.isClassDeclaration(节点) && 节点.name) {
      const 是否导出 = 节点.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) || false
      let 基类名: string | null = null
      if (节点.heritageClauses) {
        for (const 子句 of 节点.heritageClauses) {
          if (子句.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const 类型 of 子句.types) {
              if (ts.isIdentifier(类型.expression)) {
                基类名 = 类型.expression.text
              }
            }
          }
        }
      }
      文件内类.push({ 类名: 节点.name.text, 基类名, 是否导出 })
    }
    ts.forEachChild(节点, 遍历)
  }

  遍历(源文件)
  所有类.set(文件路径, 文件内类)
}

// 缓存组件判断结果
let 组件类名缓存: Map<string, boolean> = new Map()
组件类名缓存.set('组件基类', true)

function 是否为组件类(类名: string, 已访问: Set<string> = new Set()): boolean {
  if (组件类名缓存.has(类名)) return 组件类名缓存.get(类名)!
  if (已访问.has(类名)) return false
  已访问.add(类名)

  for (const [_, 类列表] of 所有类) {
    for (const 类 of 类列表) {
      if (类.类名 === 类名) {
        if (类.基类名 === null) continue
        if (是否为组件类(类.基类名, 已访问)) {
          组件类名缓存.set(类名, true)
          return true
        }
      }
    }
  }

  组件类名缓存.set(类名, false)
  return false
}

const 基础目录 = 'src/web/base'
const 组件目录 = 'src/web/components'

// 第一遍: 解析所有相关文件
const 所有文件路径 = [
  ...getAllTSFiles(基础目录).map((f) => path.join(基础目录, f)),
  ...getAllTSFiles(组件目录).map((f) => path.join(组件目录, f)),
].map((f) => (f.endsWith('.ts') || f.endsWith('.tsx') ? f : f + (fs.existsSync(f + '.ts') ? '.ts' : '.tsx')))

所有文件路径.forEach((f) => 解析文件(f))

// 第二遍: 找出包含导出组件的文件
const 目标组件文件 = getAllTSFiles(组件目录)
  .filter((a) => a !== 'index')
  .filter((a) => {
    let 路径 = path.join(组件目录, a)
    let 完整路径 = fs.existsSync(路径 + '.ts') ? 路径 + '.ts' : 路径 + '.tsx'
    let 文件类 = 所有类.get(完整路径) || []
    return 文件类.some((c) => c.是否导出 && 是否为组件类(c.类名))
  })

const code = 目标组件文件.map((a) => `export * from './${a}'`)
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
