import { app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { App } from './app/app'
import { Global } from './global/global'
import { init } from './init/init'

await init()
await new App().run()

export let 主窗口: BrowserWindow | null = null
async function 创建主窗口(): Promise<void> {
  let env = await Global.getItem('env').then((a) => a.获得环境变量())

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

  主窗口 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: 预加载脚本路径,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  if (env.NODE_ENV !== 'production') 主窗口.webContents.openDevTools()

  await 主窗口.loadURL(`http://localhost:${env.WEB_PORT}/`)
  主窗口.on('closed', () => (主窗口 = null))
}

app.on('ready', 创建主窗口)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', async () => {
  if (主窗口 === null) await 创建主窗口()
})
