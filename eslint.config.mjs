import * as lsby from '@lsby/eslint-config'

var 常用忽略域 = [...lsby.常用忽略域, 'android']
var 忽略常见文件夹 = { ignores: 常用忽略域 }

export default [
  // ..
  忽略常见文件夹,
  lsby.ts安全性,
  lsby.jsDoc安全性,
  lsby.风格美化,
]
