import * as fs from 'fs'
import inquirer from 'inquirer'
import { NodeSSH } from 'node-ssh'
import * as path from 'path'
import { 日志类 } from './tools/model'
import {
  上传文件,
  压缩项目,
  执行远程命令,
  清理旧镜像,
  获取Compose镜像列表,
  获取完整忽略名单,
  远程路径是否存在,
} from './tools/tools'

// ============= 配置区 =============
let 服务器地址 = '0.0.0.0'
let 用户名 = 'root'
let 密码 = 'xxx'
// ============= 配置区 =============

// 读取项目名称
let { name: 原始项目名称 } = JSON.parse(
  fs.readFileSync(path.join(path.resolve(import.meta.dirname, '../', '../'), 'package.json'), 'utf8'),
) as { name: string }
let 项目名称 = 原始项目名称.replace('@', '').replace(/\//g, '-')

// 本地
let 本地根目录 = path.resolve(import.meta.dirname, '../', '../')
let 本地压缩包路径: string = path.join(本地根目录, `${项目名称}.tar.gz`)

async function 主函数(): Promise<void> {
  let { 模式, 环境 } = (await inquirer.prompt([
    {
      type: 'list',
      name: '模式',
      message: '请选择操作模式:',
      choices: [
        { name: '打包镜像 (build)', value: 'build' },
        { name: '运行项目 (run)', value: 'run' },
        { name: '查看日志 (logs)', value: 'logs' },
        { name: '重启项目 (restart)', value: 'restart' },
        { name: '重新部署 (redeploy)', value: 'redeploy' },
        { name: '停止运行 (stop)', value: 'stop' },
        { name: '删除项目 (delete)', value: 'delete' },
      ],
      default: 'run',
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
      when: (待回答: { 模式: string }): boolean => 待回答.模式 !== 'delete',
    },
  ] as any)) as { 模式: string; 环境: string }

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
    if (模式 === 'run' || 模式 === 'redeploy') {
      let 提示消息 = [
        `运行模式将使用项目打包内容覆盖远程运行目录 (${远程运行目录}) 中的同名文件`,
        '这通常是预期的, 但请确保您了解后果:',
        '- 打包内容会覆盖运行目录中的同名文件',
        '- 远程新生成的文件及外部持久化数据不受影响',
        '⚠️ 风险提示: 若打包内容中包含会在运行时修改的文件(如 SQLite 数据库), 部署后这些文件将被打包中的初始版本重置, 导致远程积累的数据丢失',
      ]

      if (模式 === 'redeploy') {
        提示消息 = [
          `彻底重部署模式将完全删除远程运行目录 (${远程运行目录})`,
          '这将导致:',
          '- 强制停止并移除当前容器和关联镜像',
          '- 删除运行目录下的所有文件 (包括不在项目仓库中的数据/持久化文件等)',
          '- 之后从零开始重新部署',
          '🚨 警告: 这是一个不可逆的操作, 远程未备份的数据将永久丢失!',
        ]
      }

      let { 确认运行 } = (await inquirer.prompt([
        { type: 'confirm', name: '确认运行', message: 提示消息.join('\n') + '\n您确定要继续吗?', default: false },
      ])) as { 确认运行: boolean }
      if (确认运行 === false) {
        return
      }
    }

    // 运行确认
    if (模式 === 'delete') {
      let { 确认删除 } = (await inquirer.prompt([
        {
          type: 'confirm',
          name: '确认删除',
          message:
            [
              `🚨 警告: 此操作将从服务器彻底删除该项目的所有痕迹!`,
              `项目根目录: ${远程根目录}`,
              '操作包含:',
              '- 停止所有运行中的容器 (跨环境)',
              '- 清理所有关联镜像',
              '- 彻底删除远程目录 (build, run, upload)',
              '这是一个极其危险的操作, 不可撤销!',
            ].join('\n') + '\n您确认要这么做吗?',
          default: false,
        },
      ])) as { 确认删除: boolean }
      if (确认删除 === false) {
        return
      }
    }

    // ====================
    // 特殊流程: 彻底重部署的前置清理
    // ====================
    let 重部署前镜像列表: string[] = []
    if (模式 === 'redeploy') {
      let 某个docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)

      if ((await 远程路径是否存在(sshClient, 某个docker文件目录)) === true) {
        // 在 redeploy 模式下，为了最小化停机时间，我们不再提前停止容器
        // 我们只需记录旧项目使用的镜像 ID，以便在部署完成后进行清理
        重部署前镜像列表 = await 获取Compose镜像列表(sshClient, 某个docker文件目录, `${项目名称}-${环境}`)
      }

      日志.打印(`🧹 [redeploy] 彻底删除远程目录: ${远程运行目录}`)
      await 执行远程命令(sshClient, `rm -rf ${远程运行目录}`)
    }

    // ====================
    // 步骤: 打包并上传 (仅 build, run, rededeploy 模式需要)
    // ====================
    if (模式 === 'build' || 模式 === 'run' || 模式 === 'redeploy') {
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
    // 模式: 构建镜像
    // ====================
    if (模式 === 'build') {
      日志.打印(`🧹 清理并创建远程构建目录: ${远程构建目录}`)
      await 执行远程命令(sshClient, `rm -rf ${远程构建目录} && mkdir -p ${远程构建目录}`)

      日志.打印(`📦 解压到构建目录...`)
      await 执行远程命令(sshClient, `tar -xzf ${远程压缩包路径} -C ${远程构建目录}`)

      日志.打印(`🔨 正在使用 docker-compose 构建镜像...`)
      let 构建目录 = path.posix.resolve(远程构建docker目录, 环境)
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} build`, { 工作目录: 构建目录 })
    }

    // ====================
    // 模式: 运行项目 (run/redeploy)
    // ====================
    if (模式 === 'run' || 模式 === 'redeploy') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)

      日志.打印(`📂 确保远程运行目录存在: ${远程运行目录}`)
      await 执行远程命令(sshClient, `mkdir -p ${远程运行目录}`)

      日志.打印(`🔍 记录部署前的镜像 ID...`)
      let 旧镜像列表 = await 获取Compose镜像列表(sshClient, docker文件目录, `${项目名称}-${环境}`)
      日志.打印(`📊 当前项目使用的镜像 ID 列表: [${旧镜像列表.join(', ') === '' ? '无' : 旧镜像列表.join(', ')}]`)

      日志.打印(`📦 解压到运行目录...`)
      await 执行远程命令(sshClient, `tar -xzf ${远程压缩包路径} -C ${远程运行目录}`)

      日志.打印(`🔨 正在构建项目镜像 (此时旧服务仍在运行)...`)
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} build`, { 工作目录: docker文件目录 })

      日志.打印(`🚀 正在启动新服务 (实现极短停机更新)...`)
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} up -d --remove-orphans`, {
        工作目录: docker文件目录,
      })

      日志.打印(`✅ 确认部署后的新镜像状态...`)
      let 新镜像列表 = await 获取Compose镜像列表(sshClient, docker文件目录, `${项目名称}-${环境}`)
      日志.打印(`📊 部署后项目使用的镜像 ID 列表: [${新镜像列表.join(', ') === '' ? '无' : 新镜像列表.join(', ')}]`)

      日志.打印(`🧹 正在对比并清理不再使用的旧镜像...`)
      await 清理旧镜像(sshClient, Array.from(new Set([...旧镜像列表, ...重部署前镜像列表])), 新镜像列表, 日志)

      日志.打印(`✨ 所有操作均已完成`)
    }

    // ====================
    // 模式: 停止运行
    // ====================
    if (模式 === 'stop') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)

      if ((await 远程路径是否存在(sshClient, docker文件目录)) === false) {
        日志.打印(`⚠️ 远程部署目录不存在: ${docker文件目录}, 无需停止`)
        return
      }

      日志.打印(`🔍 停止前的镜像 ID...`)
      let 待清理镜像列表 = await 获取Compose镜像列表(sshClient, docker文件目录, `${项目名称}-${环境}`)
      日志.打印(`📊 待清理的镜像 ID 列表: [${待清理镜像列表.join(', ') === '' ? '无' : 待清理镜像列表.join(', ')}]`)

      日志.打印(`🛑 正在停止并移除容器...`)
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} down --remove-orphans`, {
        工作目录: docker文件目录,
      })

      日志.打印(`🧹 正在清理相关镜像...`)
      await 清理旧镜像(sshClient, 待清理镜像列表, [], 日志)

      日志.打印(`✨ 停止并清理完成`)
    }

    // ====================
    // 模式: 重启项目
    // ====================
    if (模式 === 'restart') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)

      if ((await 远程路径是否存在(sshClient, docker文件目录)) === false) {
        日志.打印(`⚠️ 远程部署目录不存在: ${docker文件目录}, 无法重启`)
        return
      }

      日志.打印(`🔄 正在重启容器...`)
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} restart`, { 工作目录: docker文件目录 })

      日志.打印(`✨ 重启指令已发送`)
    }

    // ====================
    // 模式: 删除项目
    // ====================
    if (模式 === 'delete') {
      let deploy目录 = path.posix.resolve(远程运行部署目录)
      if ((await 远程路径是否存在(sshClient, deploy目录)) === true) {
        日志.打印(`🔍 探测到部署目录，尝试清理运行中的容器 and 镜像...`)
        let 环境列表内容 = (await 执行远程命令(sshClient, `ls -1 ${deploy目录}`, { 打印输出: false })).stdout
        let 环境列表 = 环境列表内容
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)

        for (let 某个环境 of 环境列表) {
          let 某个环境目录 = path.posix.resolve(deploy目录, 某个环境)
          if ((await 远程路径是否存在(sshClient, 某个环境目录)) === true) {
            日志.打印(`🛑 正在停止并清理环境: ${某个环境} ...`)
            let 镜像ID列表 = await 获取Compose镜像列表(sshClient, 某个环境目录, `${项目名称}-${某个环境}`)
            await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${某个环境} down --remove-orphans`, {
              工作目录: 某个环境目录,
              抛出错误: false,
            })
            await 清理旧镜像(sshClient, 镜像ID列表, [], 日志)
          }
        }
      }

      日志.打印(`🧹 正在从远程物理删除整个项目根目录: ${远程根目录}`)
      await 执行远程命令(sshClient, `rm -rf ${远程根目录}`)
      日志.打印(`✨ 项目已彻底从服务器删除`)
      return
    }

    // ====================
    // 模式: 查看日志
    // ====================
    if (模式 === 'logs' || 模式 === 'run' || 模式 === 'restart' || 模式 === 'redeploy') {
      let docker文件目录 = path.posix.resolve(远程运行部署目录, 环境)
      日志.打印('--- 正在同步服务器实时日志 (按 Ctrl+C 退出) ---')
      await 执行远程命令(sshClient, `docker-compose -p ${项目名称}-${环境} logs -f --tail 500`, {
        工作目录: docker文件目录,
      })
    }
  } catch (_错误) {
    console.error(`❌ 错误:`, _错误)
  } finally {
    sshClient.dispose()
    if (fs.existsSync(本地压缩包路径) === true) {
      日志.打印(`🧹 运行结束清理本地文件...`)
      fs.unlinkSync(本地压缩包路径)
    }
  }
}

主函数().catch((_错误) => {
  console.error(`\n💥 发生未处理的错误:`, _错误)
  process.exit(1)
})
