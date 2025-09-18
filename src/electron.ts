import { app, BrowserWindow, screen } from 'electron'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { App } from './app/app'
import { Global } from './global/global'
import { init } from './init/init'

let log = await Global.getItem('log').then((a) => a.extend('electron'))

await init()
await new App().run()

export let 主窗口: BrowserWindow | null = null
let 窗口状态路径 = path.resolve(import.meta.dirname, 'config', 'window-state.json')

function 读取窗口状态(): Electron.Rectangle {
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
function 保存窗口状态(win: BrowserWindow): void {
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

  let 预加载脚本路径 = path.resolve(import.meta.dirname, 'tools', 'electron', 'preload.js')
  let 预加载目录 = path.dirname(预加载脚本路径)
  if (fs.existsSync(预加载目录) === false) fs.mkdirSync(预加载目录, { recursive: true })
  let 预加载脚本 = [
    '// 该文件由脚本自动生成, 请勿修改.',
    "const { contextBridge, webUtils } = require('electron')",
    "contextBridge.exposeInMainWorld('electronAPI', {",
    '  获取文件路径: (file) => webUtils.getPathForFile(file)',
    '})',
    '',
  ].join('\n')
  fs.writeFileSync(预加载脚本路径, 预加载脚本)

  let 窗口状态 = 读取窗口状态()
  主窗口 = new BrowserWindow({
    width: 窗口状态.width,
    height: 窗口状态.height,
    focusable: 开发环境 ? false : true,
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
  await 主窗口.loadURL(`http://localhost:${env.WEB_PORT}/`)

  主窗口.on('close', () => {
    if (主窗口 !== null) 保存窗口状态(主窗口)
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
