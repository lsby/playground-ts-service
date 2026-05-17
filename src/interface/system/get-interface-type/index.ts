import { 接口, 接口逻辑, 静态文件返回器 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import path from 'path'
import { 环境变量 } from '../../../global/env'

let 接口路径 = '/api/system/get-interface-type' as const
let 接口方法 = 'get' as const

let 获得类型文件路径 = (): string => {
  switch (环境变量.APP_ENV) {
    case 'development-web':
    case 'test-web':
      return path.join(path.resolve(import.meta.dirname, '../../../../'), 'src/types/interface-type.ts')
    case 'production-web':
    case 'production-electron':
      return path.join(path.resolve(import.meta.dirname, '../../../../../'), 'dist/src/types/interface-type.ts')
    case 'production-sea':
      return path.join(path.resolve(import.meta.dirname, './'), 'dist/src/types/interface-type.ts')
  }
}

let 接口逻辑实现 = 接口逻辑.构造([], async () => {
  throw new Error('该接口未开放')

  let 类型文件路径 = 获得类型文件路径()
  return new Right({ filePath: 类型文件路径 })
})

let 接口返回器 = new 静态文件返回器({ MIME类型映射: { '.ts': 'text/plain; charset=utf-8' }, 缓存控制: 'no-store' })

export default new 接口(接口路径, 接口方法, 接口逻辑实现, 接口返回器)
