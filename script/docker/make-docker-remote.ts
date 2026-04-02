import * as fs from 'fs'
import inquirer from 'inquirer'
import { NodeSSH } from 'node-ssh'
import * as path from 'path'
import { 日志类 } from './model'
import { 上传文件, 压缩项目, 执行远程命令, 清理旧镜像, 获取Compose镜像列表, 获取完整忽略名单 } from './tools'

// ============= 配置区 =============
let 服务器地址 = '0.0.0.0'
let 用户名 = 'root'
let 密码 = 'xxx'
// ============= 配置区 =============

// 读取项目名称
let { name: 原始项目名称 } = JSON.parse(
  fs.readFileSync(path.join(path.resolve(import.meta.dirname, '../', '../'), 'package.json'), 'utf8'),
)
let 项目名称 = 原始项目名称.replace('@', '').replace(/\//g, '-')

// 本地
let 本地根目录 = path.resolve(import.meta.dirname, '../', '../')
let 本地压缩包路径: string = path.join(本地根目录, `${项目名称}.tar.gz`)

async function 主函数(): Promise<void> {
  let { 模式, 环境 } = await inquirer.prompt([
    {
      type: 'list',
      name: '模式',
      message: '请选择操作模式:',
      choices: [
        { name: '打包镜像 (build)', value: 'build' },
        { name: '运行项目 (run)', value: 'run' },
        { name: '查看日志 (logs)', value: 'logs' },
      ],
      default: 'build',
    },
    {
      type: 'list',
      name: '环境',
      message: '请选择环境:',
      choices: [
        { name: '开发环境 (development)', value: 'development' },
        { name: '生产环境 (production)', value: 'production' },
      ],
      default: 'development',
    },
  ])

  let 日志 = new 日志类()
  let sshClient = new NodeSSH()

  try {
    日志.打印(`🚀 [${模式}] [${环境}] 开始连接服务器...`)
    await sshClient.connect({ host: 服务器地址, username: 用户名, password: 密码 })
    日志.打印(`✅ 已连接到 服务器`)

    // 获取远程家目录并初始化路径
    let 远程家目录 = (await 执行远程命令(sshClient, 'echo $HOME', { 打印输出: false })).stdout.trim()
    let 远程根目录 = path.posix.join(远程家目录, 项目名称)
    let 远程上传目录 = path.posix.resolve(远程根目录, 'upload')
    let 远程压缩包路径: string = path.posix.resolve(远程上传目录, `${项目名称}.tar.gz`)
    let 远程构建目录 = path.posix.resolve(远程根目录, 'build')
    let 远程构建docker目录: string = path.posix.resolve(远程构建目录, 'deploy')
    let 远程运行目录 = path.posix.resolve(远程根目录, 'run')
    let 远程运行部署目录: string = path.posix.resolve(远程运行目录, 'deploy')

    日志.打印(`📂 远程路径初始化完成:`)
    日志.打印(`- 远程家目录: ${远程家目录}`)
    日志.打印(`- 远程根目录: ${远程根目录}`)
    日志.打印(`- 远程上传目录: ${远程上传目录}`)
    日志.打印(`- 远程构建目录: ${远程构建目录}`)
    日志.打印(`- 远程运行目录: ${远程运行目录}`)

    // 运行确认
    if (模式 === 'run') {
      let { 确认运行 } = await inquirer.prompt([
        {
          type: 'confirm',
          name: '确认运行',
          message: [
            `运行模式将使用项目打包内容覆盖远程运行目录 (${远程运行目录}) 中的同名文件`,
            '这通常是预期的, 但请确保您了解后果:',
            '- 打包内容会覆盖运行目录中的同名文件',
            '- 远程新生成的文件及外部持久化数据不受影响',
            '⚠️ 风险提示: 若打包内容中包含会在运行时修改的文件(如 SQLite 数据库), 部署后这些文件将被打包中的初始版本重置, 导致远程积累的数据丢失',
            '您确定要继续吗?',
          ].join('\n'),
          default: false,
        },
      ])
      if (确认运行 === false) {
        return
      }
    }

    // ====================
    // 步骤: 打包并上传 (仅 build 和 run 模式需要)
    // ====================
    if (模式 === 'build' || 模式 === 'run') {
      日志.打印(`🧹 清理旧的本地压缩包`)
      if (fs.existsSync(本地压缩包路径) === true) {
        fs.unlinkSync(本地压缩包路径)
      }

      日志.打印(`📦 正在打包项目 (根目录: ${本地根目录})...`)
      await 压缩项目(本地压缩包路径, 本地根目录, 获取完整忽略名单(本地根目录), 日志)

      日志.打印(`🧹 清理并创建远程上传目录...`)
      await 执行远程命令(sshClient, `rm -rf ${远程上传目录} && mkdir -p ${远程上传目录}`)

      日志.打印(`⬆️ 正在上传压缩包...`)
      await 上传文件(sshClient, 本地压缩包路径, 远程压缩包路径)

      日志.打印(`🧹 清理本地压缩包`)
      if (fs.existsSync(本地压缩包路径) === true) {
        fs.unlinkSync(本地压缩包路径)
      }
    }

    // ====================
    // 模式 1: 构建镜像
    // ====================
    if (模式 === 'build') {
      日志.打印(`🧹 清理并创建远程构建目录: ${远程构建目录}`)
      await 执行远程命令(sshClient, `rm -rf ${远程构建目录} && mkdir -p ${远程构建目录}`)

      日志.打印(`📦 解压到构建目录...`)
      await 执行远程命令(sshClient, `tar -xzf ${远程压缩包路径} -C ${远程构建目录}`)

      日志.打印(`🔨 正在使用 docker-compose 构建镜像...`)
      let 构建目录 = path.posix.resolve(远程构建docker目录, 环境)
      await 执行远程命令(sshClient, `docker-compose build`, { 工作目录: 构建目录 })
    }

    // ====================
    // 模式 2: 运行
    // ====================
    if (模式 === 'run') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)

      日志.打印(`📂 确保远程运行目录存在: ${远程运行目录}`)
      await 执行远程命令(sshClient, `mkdir -p ${远程运行目录}`)

      日志.打印(`🔍 记录部署前的镜像 ID...`)
      let 旧镜像列表 = await 获取Compose镜像列表(sshClient, docker文件目录)
      日志.打印(`📊 当前项目使用的镜像 ID 列表: [${旧镜像列表.join(', ') || '无'}]`)

      日志.打印(`📦 解压到运行目录...`)
      await 执行远程命令(sshClient, `tar -xzf ${远程压缩包路径} -C ${远程运行目录}`)

      日志.打印(`🚀 停止旧服务并启动项目...`)
      await 执行远程命令(sshClient, `docker-compose down --remove-orphans || true && docker-compose up --build -d`, {
        工作目录: docker文件目录,
      })

      日志.打印(`✅ 确认部署后的新镜像状态...`)
      let 新镜像列表 = await 获取Compose镜像列表(sshClient, docker文件目录)
      日志.打印(`📊 部署后项目使用的镜像 ID 列表: [${新镜像列表.join(', ') || '无'}]`)

      日志.打印(`🧹 正在对比并清理不再使用的旧镜像...`)
      await 清理旧镜像(sshClient, 旧镜像列表, 新镜像列表, 日志)

      日志.打印(`✨ 所有操作均已完成`)
    }

    // ====================
    // 模式 3: 查看日志
    // ====================
    if (模式 === 'logs' || 模式 === 'run') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)
      console.log('--- 正在同步服务器实时日志 (按 Ctrl+C 退出) ---')
      await 执行远程命令(sshClient, 'docker-compose logs -f --tail 500', { 工作目录: docker文件目录 })
    }
  } catch (err) {
    console.error(`❌ 错误:`, err)
  } finally {
    sshClient.dispose()
    if (fs.existsSync(本地压缩包路径) === true) {
      日志.打印(`🧹 运行结束清理本地文件...`)
      fs.unlinkSync(本地压缩包路径)
    }
  }
}

主函数().catch((err) => {
  console.error(`\n💥 发生未处理的错误:`, err)
  process.exit(1)
})
