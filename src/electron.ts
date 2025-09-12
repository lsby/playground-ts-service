import { app, BrowserWindow } from 'electron'
import { App } from './app/app'
import { Global } from './global/global'

export let 主窗口: BrowserWindow | null = null

async function 创建主窗口(): Promise<void> {
  主窗口 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  主窗口.webContents.openDevTools()

  let env = await Global.getItem('env').then((a) => a.获得环境变量())
  switch (env.NODE_ENV) {
    case 'development':
      await 主窗口.loadURL(`http://127.0.0.1:${env.WEB_PORT}/`)
      break
    case 'production':
      await 主窗口.loadURL(`http://127.0.0.1:${env.WEB_PORT}/`)
      break
    case 'test':
      await 主窗口.loadURL(`http://127.0.0.1:${env.WEB_PORT}/`)
      break
    default:
      throw new Error(`意外的环境: ${env.NODE_ENV}`)
  }

  主窗口.on('closed', () => (主窗口 = null))
}

await new App().run()

app.on('ready', 创建主窗口)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', async () => {
  if (主窗口 === null) await 创建主窗口()
})
