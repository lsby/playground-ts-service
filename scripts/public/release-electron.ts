import { execSync } from 'child_process'
import fs from 'fs'
import open from 'open'
import path from 'path'
import { fileURLToPath } from 'url'

let __当前文件名 = fileURLToPath(import.meta.url)
let __当前目录名 = path.dirname(__当前文件名)
let 项目根目录 = path.resolve(__当前目录名, '../../')
let 相对发布目录 = 'release/electron'
let 待清理路径 = path.join(项目根目录, 相对发布目录)
let 生成目录 = path.join(待清理路径, 'win-unpacked')

function 寻找内置Csc编译器(): string | null {
  let 框架目录组 = ['C:\\Windows\\Microsoft.NET\\Framework64', 'C:\\Windows\\Microsoft.NET\\Framework']
  for (let 框架目录 of 框架目录组) {
    if (fs.existsSync(框架目录) === true) {
      let 版本目录组 = fs
        .readdirSync(框架目录)
        .filter((名字) => 名字.startsWith('v'))
        .sort()
        .reverse()
      for (let 目录名 of 版本目录组) {
        let csc路径 = path.join(框架目录, 目录名, 'csc.exe')
        if (fs.existsSync(csc路径) === true) {
          return csc路径
        }
      }
    }
  }
  return null
}

function 确保目录存在(目录路径: string): void {
  if (!fs.existsSync(目录路径)) {
    fs.mkdirSync(目录路径, { recursive: true })
  }
}

async function 执行构建(): Promise<void> {
  try {
    let 环境源文件 = path.resolve(项目根目录, '.env/.env.production-electron')
    let 数据库源文件 = path.resolve(项目根目录, 'db/prod-electron.db')

    // 1. 提前检查
    if (fs.existsSync(环境源文件) === false) {
      throw new Error(`❌ 未找到 ${环境源文件} 文件，无法继续。`)
    }
    if (fs.existsSync(数据库源文件) === false) {
      throw new Error(`❌ 未找到 ${数据库源文件} 文件，无法继续。`)
    }

    // 2. 清理
    console.log('正在清理生成目录...')
    let 待清理路径 = path.join(项目根目录, 相对发布目录)
    if (fs.existsSync(待清理路径) === true) {
      fs.rmSync(待清理路径, { recursive: true, force: true })
      console.log('已清理:', 待清理路径)
    }

    // 3. 运行 electron-builder
    console.log('正在启动 electron-builder...')
    execSync(`npx electron-builder -c.directories.output=${相对发布目录}`, { stdio: 'inherit', cwd: 项目根目录 })

    // 4. 后处理
    console.log('正在进行后处理...')
    if (fs.existsSync(生成目录) === false) {
      throw new Error(`❌ 生成目录不存在: ${生成目录}`)
    }

    // 复制环境变量
    let 环境目标目录 = path.join(生成目录, '.env')
    确保目录存在(环境目标目录)
    let 环境目标文件 = path.join(环境目标目录, '.env.production-electron')
    fs.copyFileSync(环境源文件, 环境目标文件)
    console.log(`✅ 已复制 ${环境源文件} 到 ${环境目标文件}`)

    // 复制数据库
    let 数据库目标目录 = path.join(生成目录, 'db')
    确保目录存在(数据库目标目录)
    let 数据库目标文件 = path.join(数据库目标目录, 'prod-electron.db')
    fs.copyFileSync(数据库源文件, 数据库目标文件)
    console.log(`✅ 已复制 ${数据库源文件} 到 ${数据库目标文件}`)

    // 生成 run.cmd
    let runCmd内容 = [
      '@echo off',
      'chcp 65001 >nul',
      'echo 正在启动 lsby-playground-ts-service (Electron模式) ...',
      'echo.',
      'cd /d "%~dp0"',
      'set "ENV_FILE_PATH=.env/.env.production-electron"',
      'set "DEBUG=@lsby:*,@lsby:playground-ts-service:*"',
      'start /wait "" "lsby-playground-ts-service.exe"',
      'if errorlevel 1 (',
      '  echo.',
      '  echo 程序异常退出, 按任意键关闭...',
      '  pause >nul',
      ')',
    ].join('\r\n')

    let runCmd路径 = path.join(生成目录, 'lsby-playground-ts-service-debug.cmd')
    fs.writeFileSync(runCmd路径, runCmd内容, { encoding: 'utf8' })
    console.log(`✅ 已生成 ${runCmd路径}`)

    // 生成 start.exe (C# 引导器)
    let cscPath = 寻找内置Csc编译器()
    let launcher源文件 = path.join(__当前目录名, 'launcher', 'launcher.cs')
    let runExe路径 = path.join(生成目录, 'lsby-playground-ts-service-start.exe')

    if (cscPath === null || fs.existsSync(cscPath) === false) {
      console.warn(`⚠️ 未找到 C# 编译器，跳过 lsby-playground-ts-service-start.exe 的编译。`)
    } else if (fs.existsSync(launcher源文件) === false) {
      console.warn(`⚠️ 未找到引导器源码: ${launcher源文件}，跳过 lsby-playground-ts-service-start.exe 的编译。`)
    } else {
      console.log('✅ 正在编译引导器 lsby-playground-ts-service-start.exe ...')
      try {
        // 使用 /target:exe 避免控制台流异常
        execSync(
          `"${cscPath}" /nologo /target:exe /out:"${runExe路径}" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll "${launcher源文件}"`,
          { stdio: 'inherit' },
        )
        console.log(`✅ 已生成 ${runExe路径}`)
      } catch (error) {
        console.error(`❌ 引导器 run.exe 编译失败:`, error)
      }
    }

    // 5. 构建完成后打开文件夹
    console.log('✅ 构建成功！')
    console.log(`✨ 成果物位置: ${生成目录}`)

    try {
      await open(生成目录, { wait: true })
    } catch (_错误) {
      // console.error('打开目录错误: %o', 错误)
    }
  } catch (错误) {
    console.error('❌ 构建过程中发生错误:', 错误)
    process.exit(1)
  }
}

执行构建().catch(console.error)
