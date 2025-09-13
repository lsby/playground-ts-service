// 该文件由脚本自动生成, 请勿修改.
const { contextBridge, webUtils } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
  获取文件路径: (file) => webUtils.getPathForFile(file)
})
