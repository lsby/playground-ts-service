import { existsSync, rmSync } from 'fs'

function 清理Web目录(): void {
  const 路径们 = [
    'dist/src/web',
    // '.parcel-cache',
  ]

  for (var 路径 of 路径们) {
    if (existsSync(路径)) {
      try {
        rmSync(路径, { recursive: true, force: true })
        console.log('已清理:', 路径)
      } catch (错误) {
        console.error('清理失败:', 错误)
        process.exit(1)
      }
    } else {
      console.log('目录不存在: %o, 跳过对该目录的清理', 路径)
    }
  }
}

清理Web目录()
