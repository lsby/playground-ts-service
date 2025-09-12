let electron = await import('electron')

import {
  常用形式接口封装,
  接口逻辑,
  构造元组,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { z } from 'zod'

let 接口路径 = '/api/demo/electron/dialog' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑.空逻辑().混合(
  接口逻辑.构造(构造元组([]), async (参数, 逻辑附加参数, 请求附加参数) => {
    let _log = 请求附加参数.log.extend(接口路径)
    new electron.Notification({ title: '提示', body: '你好世界' }).show()
    return new Right({})
  }),
)

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.never()
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
