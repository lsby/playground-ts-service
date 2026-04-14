// 读取 package.json 文件并解析
import { spawn } from 'child_process'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import { exit } from 'process'
import { z } from 'zod'

// 读取 package.json 文件并解析
let 包信息路径 = path.resolve(import.meta.dirname, '../../package.json')
let 包信息模式 = z.object({ name: z.string(), version: z.string() })
let 包信息 = 包信息模式.parse(JSON.parse(fs.readFileSync(包信息路径, 'utf-8')))

// 默认项目名称，如果项目名称以 @ 开头，去掉它
let 项目名称 = 包信息.name.startsWith('@') === true ? 包信息.name.slice(1) : 包信息.name

console.log('项目名称: %O, 项目版本: %O', 项目名称, 包信息.version)

// 用户选择镜像名称
let { 用户输入镜像名 } = (await inquirer.prompt([
  { type: 'input', name: '用户输入镜像名', message: '请输入镜像名称（默认: ' + 项目名称 + '）:', default: 项目名称 },
])) as { 用户输入镜像名: string }

// 二次确认用户输入的镜像名称
let { 是否确认镜像名 } = (await inquirer.prompt([
  {
    type: 'confirm',
    name: '是否确认镜像名',
    message: `最终的镜像名称是 "${用户输入镜像名}:${包信息.version}"，确认无误吗？`,
    default: true,
  },
])) as { 是否确认镜像名: boolean }

if (是否确认镜像名 === false) {
  console.log('用户取消了镜像名称确认。')
  exit(1)
}

console.log(`镜像名称已确认: ${用户输入镜像名}:${包信息.version}`)

// 用户选择打包环境
let { 选择环境 } = (await inquirer.prompt([
  {
    type: 'list',
    name: '选择环境',
    message: '请选择打包环境:',
    choices: ['development', 'production'],
    default: 'development',
  },
])) as { 选择环境: 'development' | 'production' }

// 根据操作系统选择 shell
let 终端 = process.platform === 'win32' ? 'cmd' : 'sh'
let 终端参数 = process.platform === 'win32' ? '/c' : '-c'

// 根据用户输入生成 Docker 构建命令
let docker文件路径 = path.join('deploy', 选择环境, 'dockerfile')
let 命令 = `cd ${path.resolve(import.meta.dirname, '../..')} && docker build -t ${用户输入镜像名}:${包信息.version} -f ${docker文件路径} .`
console.log('命令: %O', 命令)

// 使用 spawn 启动命令
let 构建进程 = spawn(终端, [终端参数, 命令])

构建进程.stdout.on('data', (数据) => {
  console.log(`stdout: ${String(数据)}`)
})

构建进程.stderr.on('data', (数据) => {
  console.error(`stderr: ${String(数据)}`)
})

构建进程.on('close', async (退出码) => {
  console.log(`子进程退出，退出码: ${退出码}`)

  if (退出码 === 0) {
    // 打包成功，询问是否执行 push
    let { 是否推送 } = (await inquirer.prompt([
      {
        type: 'confirm',
        name: '是否推送',
        message: `打包完成！是否要执行 (docker push ${用户输入镜像名}:${包信息.version}) ?`,
        default: false,
      },
    ])) as { 是否推送: boolean }

    if (是否推送 === true) {
      // 执行 docker push
      let 推送命令 = `docker push ${用户输入镜像名}:${包信息.version}`
      console.log('执行命令: %O', 推送命令)

      let 推送进程 = spawn(终端, [终端参数, 推送命令])

      推送进程.stdout.on('data', (数据) => {
        console.log(`stdout: ${String(数据)}`)
      })

      推送进程.stderr.on('data', (数据) => {
        console.error(`stderr: ${String(数据)}`)
      })

      推送进程.on('close', (推送退出码) => {
        console.log(`docker push 进程退出，退出码: ${推送退出码}`)
      })
    }
  }
})
