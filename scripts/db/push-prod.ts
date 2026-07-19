import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

let envFile = process.argv[2]
if (envFile === undefined || envFile === '') {
  console.error('缺少环境变量文件参数！')
  process.exit(1)
}

let hasMigrations = false
let migrationsPath = path.join(process.cwd(), 'prisma', 'migrations')

if (fs.existsSync(migrationsPath)) {
  let files = fs.readdirSync(migrationsPath)
  // 如果存在子文件夹，则认为有迁移记录（Prisma 会为每次迁移创建一个文件夹）
  if (files.some((f) => fs.statSync(path.join(migrationsPath, f)).isDirectory())) {
    hasMigrations = true
  }
}

try {
  if (hasMigrations) {
    console.log(`[脚本拦截] 检测到迁移记录，执行 prisma migrate deploy ...`)
    execSync(`dotenv -e ${envFile} -- prisma migrate deploy`, { stdio: 'inherit' })
  } else {
    console.log(`[脚本拦截] 未检测到任何迁移记录，尝试使用 prisma db push 尽力同步数据库 ...`)
    execSync(`dotenv -e ${envFile} -- prisma db push`, { stdio: 'inherit' })
  }

  console.log(`[脚本拦截] 生成 Prisma 客户端 ...`)
  execSync(`dotenv -e ${envFile} -- prisma generate`, { stdio: 'inherit' })
} catch (_error) {
  console.error('[脚本拦截] 数据库同步失败！')
  process.exit(1)
}
