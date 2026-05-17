import { 接口, 接口逻辑, 路径解析插件, 静态文件返回器 } from '@lsby/net-core'
import { Either, Right } from '@lsby/ts-fp-data'
import path from 'node:path'

let 接口逻辑实现 = 接口逻辑.构造(
  [new 路径解析插件()],
  async (参数, _逻辑附加参数, 请求附加参数): Promise<Either<string, { filePath: string }>> => {
    let 日志 = 请求附加参数.log
    await 日志.info('静态路由请求解析到的参数：%O', 参数.path)

    // 示例：这里直接把当前这个文件的源代码 index.ts 返回回去
    let 文件物理路径 = path.resolve(import.meta.dirname, 'index.ts')
    await 日志.info('即将返回的物理文件路径：%s', 文件物理路径)

    return new Right({ filePath: 文件物理路径 })
  },
)

let 接口返回器 = new 静态文件返回器({
  MIME类型映射: { '.ts': 'text/plain; charset=utf-8' },
  缓存控制: 'public, max-age=60',
})

// 正则表达式匹配 /api/demo/file/static-file/ 下的所有后续路径，例如 /api/demo/file/static-file/anything
export default new 接口(/^\/api\/demo\/file\/static-file\/.+$/, 'get', 接口逻辑实现, 接口返回器)
