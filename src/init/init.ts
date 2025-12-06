import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { version } from '../app/meta-info'
import { 环境变量 } from '../global/env'
import { globalLog, kysely管理器 } from '../global/global'

export async function init(): Promise<void> {
  let log = globalLog.extend('init')

  await log.debug('检索初始化标记...')
  let 系统数据 = await kysely管理器
    .获得句柄()
    .selectFrom('system_config')
    .select(['is_initialized', 'version'])
    .executeTakeFirst()
  if (系统数据?.is_initialized !== 1) {
    await log.debug('初始化标记不存在, 开始初始化流程...')

    let 项目名称: string
    let 初始用户id: string

    let 用户存在判定 = await kysely管理器
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('name', '=', 环境变量.DEFAULT_SYSTEM_USER)
      .where('pwd', '=', await bcrypt.hash(环境变量.DEFAULT_SYSTEM_PWD, 环境变量.BCRYPT_ROUNDS))
      .executeTakeFirst()

    if (用户存在判定 !== void 0) {
      初始用户id = 用户存在判定.id
    } else {
      初始用户id = randomUUID()
    }

    项目名称 = '用户'
    try {
      await log.debug(`初始化${项目名称}...`)
      await kysely管理器.执行事务(async (trx) => {
        await trx
          .insertInto('user')
          .values({
            id: 初始用户id,
            name: 环境变量.DEFAULT_SYSTEM_USER,
            pwd: await bcrypt.hash(环境变量.DEFAULT_SYSTEM_PWD, 环境变量.BCRYPT_ROUNDS),
            is_admin: 1,
          })
          .execute()
        await trx
          .insertInto('user_config')
          .values({
            id: randomUUID(),
            user_id: 初始用户id,
            theme: '系统',
          })
          .execute()
      })
      await log.debug(`初始化${项目名称}完成`)
    } catch (e) {
      await log.debug(`初始化${项目名称}失败: %O`, e)
    }

    await log.debug('初始化系统配置...')
    await kysely管理器.获得句柄().deleteFrom('system_config').execute()
    await kysely管理器
      .获得句柄()
      .insertInto('system_config')
      .values({
        id: randomUUID(),
        is_initialized: 1,
        enable_register: 0,
        version: version,
      })
      .execute()
    await log.debug('写入初始化标记完成')

    await log.debug('初始化流程结束')
  } else if (系统数据.version !== version) {
    await log.debug('初始化标记已存在, 且版本不一致, 开始升级流程...')
    // 预期的外部逻辑中:
    // - 如果数据库文件不存在, 就会使用 prisma 创建默认数据库
    // - 如果数据库文件已存在, 就不会调用 prisma, 即使是兼容的迁移也不会执行
    //
    // 这里需要手动处理数据库文件, 这是合理的, 因为 prisma 迁移很容易出现无法兼容的迁移
    // 即使是兼容的迁移, 也不要在这里通过 exec 执行 prisma 命令, 因为命令会一次应用所有迁移, 而我们无法保证未来的迁移是否兼容
    //
    // 每次升级应该确认数据库版本和程序版本, 阶梯升级
    // 例如从 0.0.1 版本升级到 0.0.3 版本, 流程是:
    // - 0.0.1 升级到 0.0.2
    // - 重启
    // - 0.0.2 升级到 0.0.3
    // - 重启
    // - 正常执行
    await log.debug('升级流程结束')
  } else {
    await log.debug('初始化标记已存在, 且版本一致, 正常启动')
  }
}
