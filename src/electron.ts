import { app, BrowserWindow, screen } from 'electron'
import fs from 'fs'
import net from 'net'
import path from 'path'
import { z } from 'zod'
import { App } from './app/app'
import { Global } from './global/global'
import { init } from './init/init'

try {
  await init()
  await new App().run()
} catch (error) {
  console.error('启动过程中发生错误:', error)
  app.quit()
}

export let 主窗口: BrowserWindow | null = null

async function 检查端口可用(端口: number): Promise<boolean> {
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

async function 获取随机可用端口(): Promise<number> {
  for (let 尝试次数 = 0; 尝试次数 < 10; 尝试次数++) {
    let 端口 = Math.floor(Math.random() * (65535 - 1024)) + 1024
    if (await 检查端口可用(端口)) {
      return 端口
    }
  }
  let log = await Global.getItem('log').then((a) => a.extend('electron'))
  log.errorSync('尝试10次后仍未找到可用端口，退出应用')
  app.quit()
  throw new Error('未找到可用端口')
}

let 资源目录 = process.resourcesPath
let 预加载脚本路径 = path.join(资源目录, 'preload.js')
let 窗口状态路径 = path.join(资源目录, 'window-state.json')

async function 读取窗口状态(): Promise<Electron.Rectangle> {
  let log = await Global.getItem('log').then((a) => a.extend('electron'))

  try {
    if (fs.existsSync(窗口状态路径)) {
      let data = z
        .object({ width: z.number(), height: z.number(), x: z.number(), y: z.number() })
        .parse(JSON.parse(fs.readFileSync(窗口状态路径, 'utf-8')))
      return {
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
      }
    }
  } catch (err) {
    log.warnSync('读取窗口状态失败:', err)
  }
  return { width: 800, height: 600, x: 0, y: 0 }
}
async function 保存窗口状态(win: BrowserWindow): Promise<void> {
  let log = await Global.getItem('log').then((a) => a.extend('electron'))

  try {
    let bounds = win.getBounds()
    if (fs.existsSync(窗口状态路径) === false) fs.mkdirSync(path.dirname(窗口状态路径), { recursive: true })
    fs.writeFileSync(窗口状态路径, JSON.stringify(bounds))
  } catch (err) {
    log.warnSync('保存窗口状态失败:', err)
  }
}
function 确保不超出屏幕(bounds: { x: number; y: number; width: number; height: number }): Electron.Rectangle {
  let 显示器 = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
  let workArea = 显示器.workArea

  let width = bounds.width
  let height = bounds.height
  let x = Math.max(workArea.x, Math.min(bounds.x, workArea.x + workArea.width - width))
  let y = Math.max(workArea.y, Math.min(bounds.y, workArea.y + workArea.height - height))

  return { x, y, width, height }
}

async function 创建主窗口(): Promise<void> {
  let env = await Global.getItem('env').then((a) => a.获得环境变量())
  let 开发环境 = env.NODE_ENV === 'development'

  let 端口 = env.WEB_PORT
  if ((await 检查端口可用(端口)) === false) {
    端口 = await 获取随机可用端口()
  }

  let 预加载脚本 = [
    '// 该文件由脚本自动生成, 请勿修改.',
    "const { contextBridge, webUtils } = require('electron')",
    "contextBridge.exposeInMainWorld('electronAPI', {",
    '  获取文件路径: (file) => webUtils.getPathForFile(file)',
    '})',
    '',
  ].join('\n')
  fs.writeFileSync(预加载脚本路径, 预加载脚本)

  let 窗口状态 = await 读取窗口状态()
  主窗口 = new BrowserWindow({
    width: 窗口状态.width,
    height: 窗口状态.height,
    // focusable: 开发环境 ? false : true,
    webPreferences: {
      preload: 预加载脚本路径,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  let 主显示器 = screen.getPrimaryDisplay()
  let 目标显示器 = screen.getDisplayNearestPoint({ x: 窗口状态.x, y: 窗口状态.y })
  let 缩放比例 = 主显示器.scaleFactor / 目标显示器.scaleFactor
  主窗口.setBounds(
    确保不超出屏幕({
      width: 窗口状态.width * 缩放比例,
      height: 窗口状态.height * 缩放比例,
      x: 窗口状态.x,
      y: 窗口状态.y,
    }),
  )

  if (开发环境) 主窗口.webContents.openDevTools({ mode: 'detach', activate: false })
  await 主窗口.loadURL(`http://localhost:${端口}/`)

  主窗口.on('close', async () => {
    if (主窗口 !== null) await 保存窗口状态(主窗口)
  })
  主窗口.on('closed', () => (主窗口 = null))
}

app.on('ready', 创建主窗口)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', async () => {
  if (主窗口 === null) await 创建主窗口()
})
