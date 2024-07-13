import fs from 'node:fs'
import { env } from 'node:process'
import dotenv from 'dotenv'
import type { z } from 'zod'
import { Log } from './log'
import { Package } from './package'

export class 环境变量管理器<环境变量描述 extends z.AnyZodObject> {
  private 环境变量: z.infer<环境变量描述> | null = null
  private log: Log | null = null

  constructor(private 环境变量描述: 环境变量描述) {}

  private async 获得log(): Promise<Log> {
    if (this.log != null) return this.log
    var name = (await new Package().getName()).replaceAll('/', ':')
    this.log = new Log(name)
    return this.log
  }

  private async 初始化(): Promise<void> {
    var log = await this.获得log()

    await log.debug('检查环境变量%o...', 'ENV_FILE_PATH')
    if (env['ENV_FILE_PATH'] != null) {
      var ENV_FILE_PATH = env['ENV_FILE_PATH']
      await log.debug('环境变量存在')
      await log.debug('查找目标文件: %o', ENV_FILE_PATH)
      if (fs.existsSync(ENV_FILE_PATH)) {
        await log.debug('已找到目标文件')
        await log.debug('将使用该文件定义的环境变量, 但不会覆盖终端环境变量', ENV_FILE_PATH)
        dotenv.config({ path: ENV_FILE_PATH })
        return
      } else {
        await log.debug(`没有找到目标文件: %o, 将使用终端环境变量`, ENV_FILE_PATH)
      }
    } else {
      await log.debug('没有找到环境变量%o, 将使用终端环境变量', 'ENV_FILE_PATH')
    }
  }

  async 获得环境变量(): Promise<z.infer<环境变量描述>> {
    var log = await this.获得log()

    if (this.环境变量 != null) return this.环境变量

    await this.初始化()
    var parseResult = this.环境变量描述.safeParse(env)
    if (parseResult.success === false) {
      await log.err('环境变量验证失败: %o', parseResult.error)
      throw new Error(parseResult.error.errors.join('\n'))
    }
    this.环境变量 = parseResult.data

    return this.环境变量
  }
}
