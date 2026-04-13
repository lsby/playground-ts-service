import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __当前文件名 = fileURLToPath(import.meta.url)
const __当前目录名 = path.dirname(__当前文件名)
const 项目根目录 = path.resolve(__当前目录名, '../../')
const 相对发布目录 = 'release/electron'
const 待清理路径 = path.join(项目根目录, 相对发布目录)
const 生成目录 = path.join(待清理路径, 'win-unpacked')

function 确保目录存在(目录路径: string): void {
  if (!fs.existsSync(目录路径)) {
    fs.mkdirSync(目录路径, { recursive: true })
  }
}

async function 执行构建(): Promise<void> {
  try {
    // 1. 清理
    console.log('正在清理生成目录...')
    const 待清理路径 = path.join(项目根目录, 相对发布目录)
    if (fs.existsSync(待清理路径)) {
      fs.rmSync(待清理路径, { recursive: true, force: true })
      console.log('已清理:', 待清理路径)
    }

    // 2. 运行 electron-builder
    console.log('正在启动 electron-builder...')
    execSync(`npx electron-builder -c.directories.output=${相对发布目录}`, { stdio: 'inherit', cwd: 项目根目录 })

    // 3. 后处理
    console.log('正在进行后处理...')
    if (!fs.existsSync(生成目录)) {
      throw new Error(`生成目录不存在: ${生成目录}`)
    }

    // 复制环境变量
    const 环境源文件 = path.resolve(项目根目录, '.env/.env.production-electron')
    if (!fs.existsSync(环境源文件)) {
      throw new Error('❌ 未找到 .env/.env.production-electron 文件，无法继续。')
    }
    const 环境目标目录 = path.join(生成目录, '.env')
    确保目录存在(环境目标目录)
    const 环境目标文件 = path.join(环境目标目录, '.env.production')
    fs.copyFileSync(环境源文件, 环境目标文件)
    console.log(`✅ 已复制 ${环境源文件} 到 ${环境目标文件}`)

    // 复制数据库
    const 数据库源文件 = path.resolve(项目根目录, 'db/prod.db')
    if (!fs.existsSync(数据库源文件)) {
      throw new Error('❌ 未找到 db/prod.db 文件，无法继续。')
    }
    const 数据库目标目录 = path.join(生成目录, 'db')
    确保目录存在(数据库目标目录)
    const 数据库目标文件 = path.join(数据库目标目录, 'prod.db')
    fs.copyFileSync(数据库源文件, 数据库目标文件)
    console.log(`✅ 已复制 ${数据库源文件} 到 ${数据库目标文件}`)

    // 生成 run.cmd
    const runCmd内容 = [
      '@echo off',
      'chcp 65001 >nul',
      'echo 正在启动 lsby-playground-ts-service (Electron模式) ...',
      'echo.',
      'cd /d "%~dp0"',
      'set "ENV_FILE_PATH=.env/.env.production"',
      'set "DEBUG=@lsby:*,@lsby:playground-ts-service:*"',
      'lsby-playground-ts-service.exe',
      'if errorlevel 1 (',
      '  echo.',
      '  echo 程序异常退出, 按任意键关闭...',
      '  pause >nul',
      ')',
    ].join('\r\n')

    const runCmd路径 = path.join(生成目录, 'run.cmd')
    fs.writeFileSync(runCmd路径, runCmd内容, { encoding: 'utf8' })
    console.log(`✅ 已生成 ${runCmd路径}`)

    console.log('\n✨ Electron 构建完成！')
    console.log(`成果物位置: ${生成目录}`)
  } catch (错误) {
    console.error('❌ 构建过程中发生错误:', 错误)
    process.exit(1)
  }
}

执行构建()
