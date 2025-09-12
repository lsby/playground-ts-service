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

  const envSource = path.resolve('.env', '.env.production')
  if (!fs.existsSync(envSource)) {
    throw new Error('❌ 未找到 .env/.env.production 文件，无法继续。')
  }
  const env目标 = path.join(生成目录, '.env')
  fs.copyFileSync(envSource, env目标)
  console.log(`✅ 已复制 ${envSource} 到 ${env目标}`)

  const runCmd内容 = ['chcp 65001', 'set DEBUG=*', 'set ENV_FILE_PATH=.env'].join('\r\n')

  const runCmd路径 = path.join(生成目录, 'run.cmd')
  fs.writeFileSync(runCmd路径, runCmd内容, { encoding: 'utf8' })
  console.log(`✅ 已生成 ${runCmd路径}`)

  const dbSource = path.resolve('db', 'prod.db')
  if (!fs.existsSync(dbSource)) {
    throw new Error('❌ 未找到 db/prod.db 文件，无法继续。')
  }
  const db目标目录 = path.join(生成目录, 'db')
  确保目录存在(db目标目录)

  const db目标 = path.join(db目标目录, 'prod.db')
  fs.copyFileSync(dbSource, db目标)
  console.log(`✅ 已复制 ${dbSource} 到 ${db目标}`)
}

执行后处理(path.resolve('package', 'win-unpacked'))
