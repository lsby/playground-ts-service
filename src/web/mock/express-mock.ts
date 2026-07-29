type 请求对象 = { body?: unknown }
type 响应对象 = unknown
type 下一步函数 = (error?: unknown) => void

export function json(): (req: 请求对象, res: 响应对象, next: 下一步函数) => void {
  return (req, _res, next) => {
    if (req.body === undefined) req.body = {}
    next()
  }
}

export default { json }
