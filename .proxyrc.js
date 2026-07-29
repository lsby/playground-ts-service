const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

let appPort

// 1. 如果运行时环境变量中已存在 APP_PORT，直接使用
if (process.env.APP_PORT) {
  appPort = process.env.APP_PORT
} else {
  // 2. 否则通过 ENV_FILE_PATH 严格读取
  const envPath = process.env.ENV_FILE_PATH
  if (!envPath) {
    throw new Error('启动代理失败：未指定 ENV_FILE_PATH 环境变量！')
  }
  if (!fs.existsSync(envPath)) {
    throw new Error(`启动代理失败：找不到环境配置文件 ${envPath}`)
  }
  const config = dotenv.parse(fs.readFileSync(envPath))
  appPort = config.APP_PORT
}

if (!appPort) {
  throw new Error('启动代理失败：未能在环境中或配置文件中找到 APP_PORT！')
}

// 动态导出配置给 Parcel
module.exports = {
  '/api': { target: `http://127.0.0.1:${appPort}`, changeOrigin: true },
  '/ws': { target: `ws://127.0.0.1:${appPort}`, ws: true, changeOrigin: true },
  '/public': { target: `http://127.0.0.1:${appPort}`, changeOrigin: true },
}
