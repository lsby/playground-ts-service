import { execSync } from 'child_process'
import fs from 'fs'
import { resolve } from 'path'

const 项目根目录 = resolve(import.meta.dirname, '../../')

const 执行命令 = (命令: string, 描述: string): void => {
  console.log(`\n📦 ${描述}...`)
  try {
    execSync(命令, {
      cwd: 项目根目录,
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'cmd.exe' : 'bash',
    })
    console.log(`✅ ${描述}完成`)
  } catch (错误) {
    console.error(`❌ ${描述}失败:`, 错误)
    throw 错误
  }
}

const 获取版本号 = (): string => {
  const 包信息路径 = resolve(项目根目录, 'package.json')
  const 包信息 = JSON.parse(fs.readFileSync(包信息路径, 'utf-8'))
  return 包信息.version
}

const 主程序 = (): void => {
  console.log('\n🚀 生成 meta 信息并提交...\n')

  try {
    const 版本号 = 获取版本号()
    console.log(`📌 当前版本: v${版本号}`)

    // 步骤 1: 生成 meta 信息
    执行命令('npm run _gen:meta-info', '生成 meta 信息')

    // 步骤 2: 添加所有更改到 git
    执行命令('git add .', '添加文件到 git')

    // 步骤 3: 创建提交
    执行命令(`git commit -m "chore: release v${版本号}"`, '创建发布提交')

    // 步骤 4: 创建标签
    执行命令(`git tag v${版本号}`, '创建版本标签')

    // 步骤 5: 推送到远程
    执行命令('git push', '推送提交到远程')
    执行命令('git push --tags', '推送标签到远程')

    console.log('\n✨ 流程完成！')
  } catch (错误) {
    console.error('\n❌ 流程中断，请检查上述错误信息')
    process.exit(1)
  }
}

主程序()
