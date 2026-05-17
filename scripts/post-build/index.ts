import { copyFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

function 复制接口类型文件(): void {
  let 源路径 = path.resolve('src/types/interface-type.ts')
  let 目标目录 = path.resolve('dist/src/types')
  let 目标路径 = path.resolve('dist/src/types/interface-type.ts')

  if (existsSync(源路径) === false) {
    console.error('未找到源接口类型文件:', 源路径)
    process.exit(1)
  }

  try {
    if (existsSync(目标目录) === false) {
      mkdirSync(目标目录, { recursive: true })
    }
    copyFileSync(源路径, 目标路径)
    console.log('已成功复制接口类型文件到 dist:', 目标路径)
  } catch (错误) {
    console.error('复制接口类型文件失败:', 错误)
    process.exit(1)
  }
}

function 主入口(): void {
  复制接口类型文件()
}

主入口()
