import archiver from 'archiver'
import * as fs from 'fs'
import { NodeSSH } from 'node-ssh'
import * as path from 'path'
import { 日志类 } from './model'

export function 获取Git忽略名单(项目根目录: string): string[] {
  let 忽略文件路径 = path.join(项目根目录, '.gitignore')

  if (fs.existsSync(忽略文件路径) === false) {
    return []
  }

  let 内容 = fs.readFileSync(忽略文件路径, 'utf-8')
  return 内容
    .split(/\r?\n/)
    .map((行: string) => 行.trim())
    .filter((行: string) => 行.length > 0 && 行.startsWith('#') === false && 行.startsWith('!') === false)
    .flatMap((行: string) => {
      let 模式 = 行
      if (模式.startsWith('/') === true) {
        模式 = 模式.substring(1)
      }
      if (模式.endsWith('/**') === true || 模式.endsWith('**') === true) {
        return [模式]
      }
      if (模式.endsWith('/') === true) {
        return [模式, `${模式}**`]
      }
      return [模式, `${模式}/**`]
    })
}

export function 获取完整忽略名单(项目根目录: string): string[] {
  return [...获取Git忽略名单(项目根目录), '.git/**']
}

export async function 压缩项目(输出路径: string, 源码目录: string, 忽略名单: string[], 日志?: 日志类): Promise<void> {
  return new Promise((resolve, reject) => {
    let 输出 = fs.createWriteStream(输出路径)
    let 归档器 = archiver('tar', { gzip: true, gzipOptions: { level: 9 } })
    let 已打包文件数 = 0

    if (日志 !== void 0) {
      归档器.on('entry', (数据) => {
        已打包文件数 += 1
        日志.打印(`➕ [${已打包文件数}] 添加文件: ${数据.name}`)
      })
    }

    输出.on('close', () => {
      if (日志 !== void 0) {
        日志.打印(`✅ 打包完成，共 ${已打包文件数} 个文件，最终大小: ${(归档器.pointer() / 1024 / 1024).toFixed(2)} MB`)
      }
      resolve()
    })

    归档器.on('error', (错误) => {
      reject(错误)
    })

    归档器.pipe(输出)

    归档器.glob('**/*', { cwd: 源码目录, ignore: 忽略名单, dot: true })

    归档器.finalize().catch(reject)
  })
}

export async function 远程路径是否存在(ssh: NodeSSH, 路径: string): Promise<boolean> {
  let 结果 = await 执行远程命令(ssh, `[ -d "${路径}" ]`, { 打印输出: false, 抛出错误: false })
  return 结果.code === 0
}

export async function 获取Compose镜像列表(ssh: NodeSSH, 工作目录: string): Promise<string[]> {
  if ((await 远程路径是否存在(ssh, 工作目录)) === false) {
    return []
  }

  let 结果 = await 执行远程命令(ssh, 'docker-compose images -q', { 工作目录: 工作目录, 打印输出: false })
  return 结果.stdout.split(/\s+/).filter((id: string) => id.length > 0)
}

export async function 清理旧镜像(
  ssh: NodeSSH,
  旧镜像列表: string[],
  新镜像列表: string[],
  日志: 日志类,
): Promise<void> {
  for (let 镜像ID of 旧镜像列表) {
    if (新镜像列表.includes(镜像ID) === false) {
      日志.打印(`检测到旧镜像 ID: ${镜像ID} 已不再用于本项目，尝试执行删除 (docker image rm)...`)
      await 执行远程命令(ssh, `docker image rm ${镜像ID} || true`)
    }
  }
}

export async function 执行远程命令(
  ssh: NodeSSH,
  命令: string,
  选项?: { 工作目录?: string; 打印输出?: boolean; 抛出错误?: boolean },
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  let 打印输出 = 选项?.打印输出 === void 0 ? true : 选项?.打印输出
  let 抛出错误 = 选项?.抛出错误 === void 0 ? true : 选项?.抛出错误

  let 结果 = await ssh.execCommand(命令, {
    cwd: 选项?.工作目录 ?? '/',
    onStdout: (数据: Buffer) => {
      if (打印输出 === true) {
        process.stdout.write(数据.toString())
      }
    },
    onStderr: (数据: Buffer) => {
      if (打印输出 === true) {
        process.stderr.write(数据.toString())
      }
    },
  })

  if (抛出错误 === true && 结果.code !== 0 && 结果.code !== null) {
    throw new Error(`远程命令执行失败 [${命令}]: ${结果.stderr}`)
  }

  return 结果
}

export async function 上传文件(ssh: NodeSSH, 本地路径: string, 远程路径: string): Promise<void> {
  try {
    await ssh.putFile(本地路径, 远程路径)
  } catch (错误) {
    throw new Error(`文件上传失败 [${本地路径} -> ${远程路径}]: ${错误}`)
  }
}
