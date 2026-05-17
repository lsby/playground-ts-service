import { 接口, 接口逻辑, 虚拟文件返回器, 路径解析插件 } from '@lsby/net-core'
import { Either, Right } from '@lsby/ts-fp-data'
import { Buffer } from 'node:buffer'

let 接口逻辑实现 = 接口逻辑.构造(
  [new 路径解析插件()],
  async (参数, _逻辑附加参数, 请求附加参数): Promise<Either<string, { fileContent: Buffer; MIMEType: string }>> => {
    let 日志 = 请求附加参数.log
    let 访问路径 = 参数.path.rawPath
    await 日志.info(`收到动态 SVG 请求，请求路径为: ${访问路径}`)

    let 矢量图片内容 = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <rect width="400" height="200" fill="#1a1a2e" rx="15"/>
  <circle cx="80" cy="100" r="50" fill="#e94560" opacity="0.8"/>
  <rect x="250" y="50" width="90" height="90" fill="#0f3460" rx="10" stroke="#16c79a" stroke-width="3"/>
  <text x="200" y="110" font-family="system-ui, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="bold">
    动态生成的文件
  </text>
  <text x="200" y="140" font-family="system-ui, sans-serif" font-size="12" fill="#16c79a" text-anchor="middle">
    路径: ${访问路径}
  </text>
  <text x="200" y="170" font-family="system-ui, sans-serif" font-size="10" fill="#888888" text-anchor="middle">
    时间戳: ${new Date().toISOString()}
  </text>
</svg>
`
    return new Right({ fileContent: Buffer.from(矢量图片内容, 'utf-8'), MIMEType: 'image/svg+xml' })
  },
)

let 接口返回器 = new 虚拟文件返回器({ 缓存控制: 'no-cache, must-revalidate' })

export default new 接口('/api/demo/file/dynamic-file', 'get', 接口逻辑实现, 接口返回器)
