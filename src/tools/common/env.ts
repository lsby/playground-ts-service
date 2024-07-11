import fs from 'node:fs'
import { env } from 'node:process'
import dotenv from 'dotenv'
import type { z } from 'zod'
import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../../global/global'

export class 环境变量管理器<环境变量描述 extends z.AnyZodObject> {
  private 环境变量: z.infer<环境变量描述> | null = null

  constructor(private 环境变量描述: 环境变量描述) {}

  private 初始化(): Task<void> {
    return new Task(async () => {
      var log = (await GlobalLog.getInstance().run()).extend('env')

      await log.debug('初始化环境变量...').run()

      await log.debug('检查%o...', 'ENV_FILE_PATH').run()
      if (env['ENV_FILE_PATH'] != null) {
        var ENV_FILE_PATH = env['ENV_FILE_PATH']
        await log.debug('- 已找到%o: %o', 'ENV_FILE_PATH', ENV_FILE_PATH).run()
        await log.debug('- 查找目标文件: %o', ENV_FILE_PATH).run()
        if (fs.existsSync(ENV_FILE_PATH)) {
          await log.debug('- 已找到目标文件: %o', ENV_FILE_PATH).run()
          await log.debug('- 将使用该文件定义的环境变量, 但不会覆盖终端环境变量', ENV_FILE_PATH).run()
          dotenv.config({ path: ENV_FILE_PATH })
          return
        } else {
          await log.debug(`- 没有找到目标文件: %o`, ENV_FILE_PATH).run()
        }
      }

      await log.debug('- 没有找到环境变量%o, 将使用终端环境变量', 'ENV_FILE_PATH').run()
    })
  }

  获得环境变量(): Task<z.infer<环境变量描述>> {
    return new Task(async () => {
      var log = (await GlobalLog.getInstance().run()).extend('env')

      if (this.环境变量 != null) return this.环境变量

      await this.初始化().run()
      var parseResult = this.环境变量描述.safeParse(env)
      if (parseResult.success === false) {
        await log.err('环境变量验证失败: %o', parseResult.error).run()
        throw new Error(parseResult.error.errors.join('\n'))
      }
      this.环境变量 = parseResult.data

      return this.环境变量
    })
  }
}
