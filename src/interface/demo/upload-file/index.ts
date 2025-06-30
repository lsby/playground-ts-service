import {
  去除只读,
  合并插件结果,
  常用形式转换器,
  接口,
  接口逻辑,
  获得接口逻辑正确类型,
  获得接口逻辑错误类型,
} from '@lsby/net-core'
import { 文件上传插件 } from '@lsby/net-core-file-upload'
import { Either, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 登录检查器 } from '../../../logic/check/check-login'

let 接口路径 = '/api/demo/upload-file' as const
let 接口方法 = 'post' as const

let 插件 = [
  new Task(async () => {
    let env = await (await Global.getItem('env')).获得环境变量()
    return new 文件上传插件({ 文件最大大小: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 })
  }),
] as const

let 逻辑错误类型Zod = z.enum(['未登录'])
let 逻辑正确类型Zod = z.object({})

type 附加参数类型 = { userId: string }
class 逻辑实现 extends 接口逻辑<插件类型, 附加参数类型, 逻辑错误类型, 逻辑正确类型> {
  override 获得插件们(): 插件类型 {
    return [...插件]
  }

  override async 实现(参数: 参数类型, 附加参数: 附加参数类型): Promise<Either<逻辑错误类型, 逻辑正确类型>> {
    let log = (await Global.getItem('log')).extend(接口路径)
    await log.debug('userId为%o的用户, 上传的文件信息: %j', 附加参数.userId, 参数.files)
    return new Right({})
  }
}
let 接口实现 = 接口逻辑.混合([new 登录检查器(), new 逻辑实现()])

type 插件类型 = 去除只读<typeof 插件>
type 参数类型 = 合并插件结果<插件类型>
type 逻辑错误类型 = z.infer<typeof 逻辑错误类型Zod>
type 逻辑正确类型 = z.infer<typeof 逻辑正确类型Zod>
let 接口错误输出形式 = z.object({ status: z.literal('fail'), data: 逻辑错误类型Zod })
let 接口正确输出形式 = z.object({ status: z.literal('success'), data: 逻辑正确类型Zod })
let 接口转换器 = new 常用形式转换器<获得接口逻辑错误类型<typeof 接口实现>, 获得接口逻辑正确类型<typeof 接口实现>>()
export default new 接口(接口路径, 接口方法, 接口实现, 接口错误输出形式, 接口正确输出形式, 接口转换器)
