import { execSync } from 'child_process'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../')
const seaDir = path.join(root, 'package/sea')

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
  // 1. 警告与确认
  const warning = `
！ 注意事项 (Node.js SEA 构建) ！
--------------------------------------------------
1. 此操作将构建一个“单文件”可执行程序 (Windows .exe)。
2. 已确认已替换 bcrypt 为 bcryptjs，且无其他原生依赖。
3. 注意：由于使用了静态文件服务和数据库，虽然 JS 代码被打包进了 exe，但：
   - 静态资源 (public/, dist/src/web/) 仍需在运行目录下存在（后端会查找它们）。
   - 数据库文件 (db/) 将在运行时创建或读取。
4. 打包工具：esbuild (合并代码) + Node.js SEA (生成 blob) + postject (注入二进制)。
--------------------------------------------------
`

  console.log(warning)

  const answers = await inquirer.prompt([
    { type: 'confirm', name: 'proceed', message: '确认已理解风险并继续？', default: false },
  ])

  if (answers.proceed !== true) {
    console.log('用户取消。')
    process.exit(0)
  }

  try {
    // 2. 准备目录
    if (fs.existsSync(seaDir)) {
      fs.rmSync(seaDir, { recursive: true, force: true })
    }
    fs.mkdirSync(seaDir, { recursive: true })

    console.log('[1/8] 正在使用 esbuild 合并代码...')
    execSync(
      `npx esbuild src/server.ts --bundle --platform=node --target=node22 --outfile=package/sea/server.bundle.js --format=cjs --packages=bundle --define:import.meta.dirname="__dirname"`,
      { stdio: 'inherit', cwd: root },
    )

    console.log('[2/8] 正在生成 SEA 配置...')
    const seaConfig = {
      main: 'package/sea/server.bundle.js',
      output: 'package/sea/sea-prep.blob',
      disableExperimentalSEAWarning: true,
      useCodeCache: true,
    }
    fs.writeFileSync(path.join(root, 'package/sea/sea-config.json'), JSON.stringify(seaConfig, null, 2))

    console.log('[3/8] 正在生成 SEA blob...')
    execSync(`node --experimental-sea-config package/sea/sea-config.json`, { stdio: 'inherit', cwd: root })

    console.log('[4/8] 正在准备可执行文件...')
    const nodeExe = process.execPath
    const targetExe = path.join(seaDir, 'lsby-playground-ts-service.exe')
    fs.copyFileSync(nodeExe, targetExe)

    console.log('[5/8] 正在移除 Windows 代码签名...')
    // Windows 下 node.exe 是签名的, postject 无法注入已签名的二进制
    try {
      execSync(`signtool remove /s "${targetExe}"`, { stdio: 'inherit', cwd: root })
    } catch (_) {
      console.log('  signtool 不可用, 将使用 --overwrite 标志')
    }

    console.log('[6/8] 正在注入 blob...')
    execSync(
      `npx postject "${targetExe}" NODE_SEA_BLOB "package/sea/sea-prep.blob" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --overwrite`,
      { stdio: 'inherit', cwd: root },
    )

    console.log('[7/8] 正在整理资源文件夹...')
    递归复制(path.join(root, 'public'), path.join(seaDir, 'public'))
    递归复制(path.join(root, 'dist/src/web'), path.join(seaDir, 'dist/src/web'))
    递归复制(path.join(root, 'db'), path.join(seaDir, 'db'))

    // 拷贝 sqlite wasm (node-sqlite3-wasm 库需要它在二进制运行目录下)
    const wasmPath = path.join(root, 'node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm')
    if (fs.existsSync(wasmPath)) {
      fs.copyFileSync(wasmPath, path.join(seaDir, 'node-sqlite3-wasm.wasm'))
    }

    // 复制环境变量并修改为 sea 模式
    if (fs.existsSync(path.join(root, '.env/.env.production-sea'))) {
      if (fs.existsSync(path.join(seaDir, '.env')) === false) fs.mkdirSync(path.join(seaDir, '.env'))
      let envContent = fs.readFileSync(path.join(root, '.env/.env.production-sea'), 'utf-8')
      fs.writeFileSync(path.join(seaDir, '.env/.env.production-sea'), envContent)
    }

    console.log('[8/8] 正在生成启动脚本...')
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

run()
