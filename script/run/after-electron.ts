import * as fs from 'fs'
import * as path from 'path'

function 确保目录存在(目录路径: string): void {
  if (!fs.existsSync(目录路径)) {
    fs.mkdirSync(目录路径, { recursive: true })
  }
}

function 执行后处理(生成目录: string): void {
  if (!fs.existsSync(生成目录)) {
    throw new Error(`生成目录不存在: ${生成目录}`)
  }

  // 1️⃣ 复制 .env.production 或 .env
  const envSource候选 = [path.resolve('.env', '.env.production'), path.resolve('.env', '.env')]

  let envSource: string | null = null
  for (const filePath of envSource候选) {
    if (fs.existsSync(filePath)) {
      envSource = filePath
      break
    }
  }

  if (envSource === null) {
    console.warn('⚠️ 未找到 .env 或 .env.production 文件，跳过复制。')
  } else {
    const env目标 = path.join(生成目录, '.env')
    fs.copyFileSync(envSource, env目标)
    console.log(`✅ 已复制 ${envSource} 到 ${env目标}`)
  }

  // 2️⃣ 写 run.cmd
  const runCmd内容 = ['chcp 65001', 'set DEBUG=*', 'set ENV_FILE_PATH=.env', 'playground-ts-service'].join('\r\n')

  const runCmd路径 = path.join(生成目录, 'run.cmd')
  fs.writeFileSync(runCmd路径, runCmd内容, { encoding: 'utf8' })
  console.log(`✅ 已生成 ${runCmd路径}`)

  // 3️⃣ 复制 db/prod.db → 生成目录/db/prod.db
  const dbSource = path.resolve('db', 'prod.db')
  if (fs.existsSync(dbSource)) {
    const db目标目录 = path.join(生成目录, 'db')
    确保目录存在(db目标目录)

    const db目标 = path.join(db目标目录, 'prod.db')
    fs.copyFileSync(dbSource, db目标)
    console.log(`✅ 已复制 ${dbSource} 到 ${db目标}`)
  } else {
    console.warn('⚠️ 未找到 db/prod.db，跳过复制。')
  }
}

// 示例调用：传入 electron-builder 输出目录
执行后处理(path.resolve('package', 'win-unpacked'))
