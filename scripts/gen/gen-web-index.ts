import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

function 获取目录内所有TS文件(目录: string, 根目录: string = 目录): string[] {
  let 结果: string[] = []

  let 列表 = fs.readdirSync(目录)
  for (let 文件 of 列表) {
    let 完整路径 = path.join(目录, 文件)
    let 状态 = fs.statSync(完整路径)

    if (状态.isDirectory() === true) {
      结果 = 结果.concat(获取目录内所有TS文件(完整路径, 根目录))
    } else if (状态.isFile() === true && 完整路径.endsWith('.ts') === true) {
      let 相对路径 = path.relative(根目录, 完整路径).replace(/\\/g, '/').replace(/\.ts$/, '')
      结果.push(相对路径)
    }
  }

  return 结果
}

type 类信息 = { 类名: string; 基类名: string | null; 是否导出: boolean }

let 所有类 = new Map<string, 类信息[]>()

function 解析文件(文件路径: string): void {
  if (fs.existsSync(文件路径) === false) return
  let 源码 = fs.readFileSync(文件路径, 'utf-8')
  let 源文件 = ts.createSourceFile(文件路径, 源码, ts.ScriptTarget.Latest, true)
  let 文件内类: 类信息[] = []

  function 遍历(节点: ts.Node): void {
    if (ts.isClassDeclaration(节点) === true && 节点.name !== undefined) {
      let 是否导出 = 节点.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false
      let 基类名: string | null = null
      if (节点.heritageClauses !== undefined) {
        for (let 子句 of 节点.heritageClauses) {
          if (子句.token === ts.SyntaxKind.ExtendsKeyword) {
            for (let 类型 of 子句.types) {
              if (ts.isIdentifier(类型.expression) === true) {
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
let 组件类名缓存 = new Map<string, boolean>()
组件类名缓存.set('组件基类', true)

function 是否为组件类(类名: string, 已访问 = new Set<string>()): boolean {
  if (组件类名缓存.has(类名) === true) return 组件类名缓存.get(类名) ?? false
  if (已访问.has(类名) === true) return false
  已访问.add(类名)

  for (let [_, 类列表] of 所有类) {
    for (let 类 of 类列表) {
      if (类.类名 === 类名) {
        if (类.基类名 === null) continue
        if (是否为组件类(类.基类名, 已访问) === true) {
          组件类名缓存.set(类名, true)
          return true
        }
      }
    }
  }

  组件类名缓存.set(类名, false)
  return false
}

let 基础目录 = 'src/web/base'
let 组件目录 = 'src/web/components'

// 第一遍: 解析所有相关文件
let 所有文件路径 = [
  ...获取目录内所有TS文件(基础目录).map((f) => path.join(基础目录, f)),
  ...获取目录内所有TS文件(组件目录).map((f) => path.join(组件目录, f)),
].map((f) => (f.endsWith('.ts') === true ? f : f + '.ts'))

所有文件路径.forEach((f) => 解析文件(f))

// 第二遍: 找出包含导出组件的文件
let 目标组件文件 = 获取目录内所有TS文件(组件目录)
  .filter((a) => a !== 'index')
  .filter((a) => {
    let 路径项 = path.join(组件目录, a)
    let 完整路径 = 路径项 + '.ts'
    let 文件类 = 所有类.get(完整路径) ?? []
    return 文件类.some((c) => c.是否导出 === true && 是否为组件类(c.类名) === true)
  })

let 代码列表 = 目标组件文件.map((a) => `export * from './${a}'`)
let 新内容 = [`// 该文件由脚本自动生成, 请勿修改.`, ...代码列表, ''].join('\n')

let 目标文件 = 'src/web/components/index.ts'
let 已有内容 = ''
try {
  已有内容 = fs.readFileSync(目标文件, 'utf-8')
} catch (_错误) {
  // 文件不存在时，已有内容为空字符串
}

if (已有内容 !== 新内容) {
  fs.writeFileSync(目标文件, 新内容)
  console.log(`文件 ${目标文件} 已更新。`)
} else {
  console.log(`文件 ${目标文件} 内容未变化，跳过写入。`)
}
