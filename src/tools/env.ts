import fs from 'node:fs'
import path from 'node:path'
import { env } from 'node:process'
import dotenv from 'dotenv'
import type { z } from 'zod'
import { Task } from '@lsby/ts-fp-data'
import { GlobalLog } from '../global/global'

export class 环境变量管理器<环境变量描述 extends z.AnyZodObject> {
  private 环境变量: z.infer<环境变量描述> | null = null

  constructor(private 环境变量描述: 环境变量描述) {}

  初始化(): Task<void> {
    return new Task(async () => {
      const log = (await GlobalLog.getInstance().run()).extend('env')

      await log.debug('初始化环境变量...').run()

      await log.debug('开始初始化环境变量...').run()
      await log.info('环境变量文件读取顺序:').run()
      await log.info('- 环境变量%o指定的文件', 'ENV_FILE_PATH').run()
      await log.info('- 当前终端路径的.env文件').run()
      await log.info('- 源代码结构下的.env文件').run()

      await log.debug("检查'ENV_FILE_PATH'...").run()
      if (env['ENV_FILE_PATH'] !== undefined) {
        const ENV_FILE_PATH = env['ENV_FILE_PATH']
        await log
          .debug(
            `- 已找到环境变量'ENV_FILE_PATH'的定义, 将使用 ${ENV_FILE_PATH} 文件定义的环境变量, 但不会覆盖终端环境变量`,
          )
          .run()
        dotenv.config({ path: ENV_FILE_PATH })
        return
      }
      await log.debug("- 没有找到环境变量'ENV_FILE_PATH'").run()

      await log.debug('检查当前终端路径的.env文件...').run()
      const cwdEnvPath = path.resolve(process.cwd(), './.env')
      await log.debug('- 当前终端路径: %o', cwdEnvPath).run()
      if (fs.existsSync(cwdEnvPath) && fs.statSync('./.env').isFile()) {
        await log.debug(`- 已找到目标文件: ${cwdEnvPath}`).run()
        await log.debug('- 将使用该文件定义的环境变量, 但不会覆盖终端环境变量').run()
        dotenv.config({ path: cwdEnvPath })
        return
      }
      await log.debug('- 没有找到当前终端路径的.env文件').run()

      await log.debug('检查源代码结构下的.env文件...').run()
      await log.debug('读取NODE_ENV描述...').run()
      const NODE_ENV = env['NODE_ENV']
      if (NODE_ENV == null) {
        await log.err('- 没有找到环境变量: NODE_ENV').run()
        throw new Error('没有找到环境变量: NODE_ENV')
      }
      await log.debug('- 当前NODE_ENV: %o', NODE_ENV).run()
      const codeEnvPath = path.resolve(import.meta.dirname || __dirname, `../../.env/${NODE_ENV}.env`)
      await log.debug('- 当前源代码对应的.env文件夹路径: %o, 要读取的文件名: %o', cwdEnvPath, `${NODE_ENV}.env`).run()
      if (fs.existsSync(codeEnvPath) && fs.statSync(codeEnvPath).isFile()) {
        await log.debug('- 已找到目标文件').run()
        await log.debug('- 将使用该文件定义的环境变量, 但不会覆盖终端环境变量').run()
        dotenv.config({ path: codeEnvPath })
        return
      }
      await log.debug(`- 没有找到当前终端路径的.env文件: ${codeEnvPath}`).run()

      await log.debug('没有找到任何环境变量文件, 使用终端环境变量').run()
    })
  }

  获得环境变量(): Task<z.infer<环境变量描述>> {
    return new Task(async () => {
      const log = (await GlobalLog.getInstance().run()).extend('env')

      if (this.环境变量 != null) return this.环境变量

      await this.初始化().run()
      const parseResult = this.环境变量描述.safeParse(env)
      if (parseResult.success === false) {
        await log.err('环境变量验证失败: %o', parseResult.error).run()
        throw new Error(parseResult.error.errors.join('\n'))
      }
      this.环境变量 = parseResult.data

      return this.环境变量
    })
  }
}
