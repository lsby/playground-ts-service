import net from 'net'
import { globalLog } from '../global/global'

/**
 * 检查指定端口是否可用
 */
export async function 检查端口可用(端口: number): Promise<boolean> {
  return new Promise((resolve) => {
    let 服务器 = net.createServer()
    服务器.listen(端口, '127.0.0.1', () => {
      服务器.close()
      resolve(true)
    })
    服务器.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 获取一个随机的可用端口
 * 尝试10次，如果都失败则退出应用
 */
export async function 获取随机可用端口(): Promise<number> {
  for (let 尝试次数 = 0; 尝试次数 < 10; 尝试次数++) {
    let 端口 = Math.floor(Math.random() * (65535 - 1024)) + 1024
    if (await 检查端口可用(端口)) {
      return 端口
    }
  }

  let log = globalLog.extend('electron')
  await log.error('尝试10次后仍未找到可用端口，退出应用')

  throw new Error('未找到可用端口')
}
