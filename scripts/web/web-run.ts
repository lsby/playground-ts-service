import { readdirSync } from 'fs'
import path from 'path'

function getHtmlEntries(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    let entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return getHtmlEntries(entryPath)
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : []
  })
}

import { spawn } from 'child_process'
import { config } from 'dotenv'

// 加载环境变量
let envFile = process.env['ENV_FILE_PATH']
if (envFile === undefined) {
  console.error('未提供 ENV_FILE_PATH 环境变量！为了避免前端打包到错误的配置，必须指定配置文件。')
  process.exit(1)
}
config({ path: envFile })

function 启动任务(): void {
  let 子进程 = spawn('npm', ['run', '_clean:web'], { stdio: 'inherit', shell: true })

  子进程.on('close', (代码: number | null) => {
    if (代码 !== 0) {
      console.error('清理脚本失败，退出码:', 代码)
      重启()
      return
    }

    let webPort = process.env['WEB_PORT']
    let hmrPort = process.env['WEB_HMR_PORT']
    if (webPort === undefined || hmrPort === undefined) {
      console.error('未在环境变量中提供 WEB_PORT 或 WEB_HMR_PORT！')
      process.exit(1)
    }

    let parcel进程 = spawn(
      'parcel',
      [
        '--no-cache',
        '--no-autoinstall',
        '--dist-dir',
        'dist/src/web',
        '--watch-for-stdin',
        '--port',
        webPort,
        '--hmr-port',
        hmrPort,
        ...getHtmlEntries('src/web/page'),
        // '--lazy',
      ],
      { stdio: 'inherit', shell: true },
    )

    parcel进程.on('close', () => {
      console.log('崩了！重启！')
      setTimeout(() => 重启(), 1000)
    })
  })
}

function 重启(): void {
  启动任务()
}

启动任务()
