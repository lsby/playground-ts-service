import * as eslintConfig from '@lsby/eslint-config'
import projectRules from './script/eslint/project-rules.js'

var 常用忽略域 = [...eslintConfig.常用忽略域, 'android', 'package']
var 忽略常见文件夹 = { ignores: 常用忽略域 }

export default [
  // ..
  忽略常见文件夹,
  eslintConfig.ts安全性,
  eslintConfig.jsDoc安全性,
  eslintConfig.风格美化,
  {
    plugins: { project: projectRules },
    rules: {
      // ..
      'project/no-dom-query': 'error',
    },
  },
]
