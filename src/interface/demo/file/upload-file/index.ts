import {
  常用形式接口封装,
  接口逻辑,
  构造元组,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { 文件上传插件 } from '@lsby/net-core-file-upload'
import { Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../../global/global'
import { 检查登录 } from '../../../../interface-logic/check/check-login-jwt'

let 接口路径 = '/api/demo/file/upload-file' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(
    new 检查登录(
      [
        new Task(async () => (await Global.getItem('jwt-plugin')).解析器),
        new Task(async () => await Global.getItem('kysely-plugin')),
      ],
      () => ({
        表名: 'user',
        id字段: 'id',
      }),
    ),
  )
  .混合(
    接口逻辑.构造(
      构造元组([
        new Task(async () => {
          let env = await (await Global.getItem('env')).获得环境变量()
          return new 文件上传插件({ 文件最大大小: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 })
        }),
      ]),
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let log = 请求附加参数.log.extend(接口路径)
        await log.debug('userId为%o的用户, 上传的文件信息: %j', 逻辑附加参数.userId, 参数.files)
        return new Right({})
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
