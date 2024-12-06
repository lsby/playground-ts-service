import { spawn } from 'child_process'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import { exit } from 'process'

// 读取 package.json 文件并解析
const packageJsonPath = path.resolve(import.meta.dirname, '../../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// 默认项目名称，如果项目名称以 @ 开头，去掉它
let projectName = packageJson.name.startsWith('@') ? packageJson.name.slice(1) : packageJson.name

console.log('项目名称: %O, 项目版本: %O', projectName, packageJson.version)

// 用户选择镜像名称
const { customName } = await inquirer.prompt([
  {
    type: 'input',
    name: 'customName',
    message: '请输入镜像名称（默认: ' + projectName + '）:',
    default: projectName,
  },
])

// 二次确认用户输入的镜像名称
const { confirmedName } = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'confirmedName',
    message: `最终的镜像名称是 "${customName}:${packageJson.version}"，确认无误吗？`,
    default: true,
  },
])

if (!confirmedName) {
  console.log('用户取消了镜像名称确认。')
  exit(1)
}

console.log(`镜像名称已确认: ${customName}:${packageJson.version}`)

// 用户选择打包环境
const { environment } = await inquirer.prompt([
  {
    type: 'list',
    name: 'environment',
    message: '请选择打包环境:',
    choices: ['development', 'production'],
    default: 'development',
  },
])

// 根据用户输入生成 Docker 构建命令
const command = `cd ${import.meta.dirname}/../.. && docker build -t ${customName}:${packageJson.version} -f ./deploy/${environment}/dockerfile .`
console.log('命令: %O', command)

// 使用 spawn 启动命令
const process = spawn('cmd', ['/c', command])

process.stdout.on('data', (data: Buffer) => {
  console.log(`stdout: ${data.toString()}`)
})

process.stderr.on('data', (data: Buffer) => {
  console.error(`stderr: ${data.toString()}`)
})

process.on('close', async (code: number) => {
  console.log(`child process exited with code ${code}`)

  if (code === 0) {
    // 打包成功，询问是否执行 push
    const { doPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'doPush',
        message: `打包完成！是否要执行 (docker push ${customName}:${packageJson.version}) ?`,
        default: false,
      },
    ])

    if (doPush) {
      // 执行 docker push
      const pushCommand = `docker push ${customName}:${packageJson.version}`
      console.log('执行命令: %O', pushCommand)

      const pushProcess = spawn('cmd', ['/c', pushCommand])

      pushProcess.stdout.on('data', (data: Buffer) => {
        console.log(`stdout: ${data.toString()}`)
      })

      pushProcess.stderr.on('data', (data: Buffer) => {
        console.error(`stderr: ${data.toString()}`)
      })

      pushProcess.on('close', (pushCode: number) => {
        console.log(`docker push process exited with code ${pushCode}`)
      })
    }
  }
})
