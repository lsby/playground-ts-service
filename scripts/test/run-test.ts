import { execSync } from 'child_process'
import inquirer from 'inquirer'

async function 主函数(): Promise<void> {
  let { 过滤器, 生成覆盖率 } = (await inquirer.prompt([
    {
      type: 'input',
      name: '过滤器',
      message: '请输入要运行的接口路径关键字正则 (留空则代表全部运行 ".*"):',
      default: '.*',
    },
    { type: 'confirm', name: '生成覆盖率', message: '是否生成代码覆盖率报告并自动打开?', default: false },
  ] as any)) as { 过滤器: string; 生成覆盖率: boolean }

  let 实际过滤器 = 过滤器.trim() === '' ? '.*' : 过滤器.trim()

  let 运行命令 = `lsby-net-core-gen-test ./tsconfig.json ./src/interface ./test/unit/unit-test.test.ts ${实际过滤器} && vitest run`

  if (生成覆盖率 === true) {
    运行命令 += ' --coverage && open-cli ./coverage/index.html'
  }

  console.log(`\n==========================================`)
  console.log(`🚀 开始执行单元测试 (过滤器: ${实际过滤器})`)
  console.log(`==========================================\n`)

  try {
    execSync(运行命令, { stdio: 'inherit', env: process.env })
  } catch (错误) {
    console.error(`\n❌ 测试执行失败 : ${错误}`)
    process.exit(1)
  }

  console.log(`\n✅ 单元测试执行成功！`)
}

主函数().catch((错误) => {
  console.error(`\n💥 发生未处理的错误:`, 错误)
  process.exit(1)
})
