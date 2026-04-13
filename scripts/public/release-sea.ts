import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let __dirname = path.dirname(fileURLToPath(import.meta.url))
let root = path.resolve(__dirname, '../../')
let 相对发布目录 = 'release/sea'
let seaDir = path.join(root, 相对发布目录)

/**
 * 递归复制文件夹
 */
function 递归复制(src: string, dest: string): void {
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  let entries = fs.readdirSync(src, { withFileTypes: true })
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name)
    let destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      递归复制(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

async function run(): Promise<void> {
  try {
    // 1. 准备目录
    console.log('[1/9] 正在准备目录...')
    if (fs.existsSync(seaDir)) {
      fs.rmSync(seaDir, { recursive: true, force: true })
    }
    fs.mkdirSync(seaDir, { recursive: true })

    console.log('[2/9] 正在使用 esbuild 合并代码...')
    execSync(
      `npx esbuild src/server.ts --bundle --platform=node --target=node22 --outfile=${相对发布目录}/server.bundle.js --format=cjs --packages=bundle --define:import.meta.dirname="__dirname"`,
      { stdio: 'inherit', cwd: root },
    )

    console.log('[3/9] 正在生成 SEA 配置...')
    let seaConfig = {
      main: `${相对发布目录}/server.bundle.js`,
      output: `${相对发布目录}/sea-prep.blob`,
      disableExperimentalSEAWarning: true,
      useCodeCache: true,
    }
    fs.writeFileSync(path.join(root, `${相对发布目录}/sea-config.json`), JSON.stringify(seaConfig, null, 2))

    console.log('[4/9] 正在生成 SEA blob...')
    execSync(`node --experimental-sea-config ${相对发布目录}/sea-config.json`, { stdio: 'inherit', cwd: root })

    console.log('[5/9] 正在准备可执行文件...')
    let nodeExe = process.execPath
    let targetExe = path.join(seaDir, 'lsby-playground-ts-service.exe')
    fs.copyFileSync(nodeExe, targetExe)

    console.log('[6/9] 正在移除 Windows 代码签名...')
    // Windows 下 node.exe 是签名的, postject 无法注入已签名的二进制
    try {
      execSync(`signtool remove /s "${targetExe}"`, { stdio: 'inherit', cwd: root })
    } catch (_) {
      console.log('  signtool 不可用, 将使用 --overwrite 标志')
    }

    console.log('[7/9] 正在注入 blob...')
    execSync(
      `npx postject "${targetExe}" NODE_SEA_BLOB "${相对发布目录}/sea-prep.blob" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --overwrite`,
      { stdio: 'inherit', cwd: root },
    )

    console.log('[8/9] 正在整理资源文件夹...')
    递归复制(path.join(root, 'public'), path.join(seaDir, 'public'))
    递归复制(path.join(root, 'dist/src/web'), path.join(seaDir, 'dist/src/web'))
    递归复制(path.join(root, 'db'), path.join(seaDir, 'db'))

    // 拷贝 sqlite wasm (node-sqlite3-wasm 库需要它在二进制运行目录下)
    let wasmPath = path.join(root, 'node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm')
    if (fs.existsSync(wasmPath)) {
      fs.copyFileSync(wasmPath, path.join(seaDir, 'node-sqlite3-wasm.wasm'))
    }

    // 复制环境变量并修改为 sea 模式
    if (fs.existsSync(path.join(root, '.env/.env.production-sea'))) {
      if (fs.existsSync(path.join(seaDir, '.env')) === false) fs.mkdirSync(path.join(seaDir, '.env'))
      let envContent = fs.readFileSync(path.join(root, '.env/.env.production-sea'), 'utf-8')
      fs.writeFileSync(path.join(seaDir, '.env/.env.production-sea'), envContent)
    }

    console.log('[9/9] 正在生成启动脚本...')
    // 生成 run.cmd 启动脚本
    let runCmd = [
      '@echo off',
      'chcp 65001 >nul',
      'echo 正在启动 lsby-playground-ts-service ...',
      'echo.',
      'cd /d "%~dp0"',
      'set "ENV_FILE_PATH=./.env/.env.production-sea"',
      'set "DEBUG=@lsby:*,@lsby:playground-ts-service:*"',
      'lsby-playground-ts-service.exe',
      'if errorlevel 1 (',
      '  echo.',
      '  echo 程序异常退出, 按任意键关闭...',
      '  pause >nul',
      ')',
      '',
    ].join('\r\n')
    fs.writeFileSync(path.join(seaDir, 'run.cmd'), runCmd)

    // 清理中间文件
    let 中间文件 = ['server.bundle.js', 'sea-prep.blob', 'sea-config.json']
    for (let 文件 of 中间文件) {
      let 路径 = path.join(seaDir, 文件)
      if (fs.existsSync(路径)) fs.rmSync(路径)
    }

    console.log('\n✅ 构建成功！')
    console.log(`成果物位置: ${seaDir}`)
    console.log('---')
    console.log('运行说明：')
    console.log('  双击 run.cmd 即可启动服务。')
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

run().catch(console.error)
