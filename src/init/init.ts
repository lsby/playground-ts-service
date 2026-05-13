import bcrypt from 'bcryptjs'
import { randomBytes, randomUUID } from 'crypto'
import { version } from '../app/meta-info'
import { 环境变量 } from '../global/env'
import { globalLog, kysely管理器 } from '../global/global'

export async function init(): Promise<void> {
  let log = globalLog.extend('init')

  await log.debug('检索系统配置...')
  let 系统数据 = await kysely管理器.获得句柄().selectFrom('system_config').selectAll().executeTakeFirst()

  // 1. 处理 JWT 密钥
  let jwt密钥 = 系统数据?.jwt_secret
  if (jwt密钥 === undefined) {
    jwt密钥 = 环境变量.DEFAULT_JWT_SECRET === '' ? randomBytes(32).toString('hex') : 环境变量.DEFAULT_JWT_SECRET
  }

  // 2. 处理初始化逻辑
  if (系统数据?.is_initialized !== 1) {
    await log.debug('系统未初始化, 开始初始化流程...')

    let 初始密码 = 环境变量.DEFAULT_SYSTEM_PWD
    let 密码是生成的 = false
    if (初始密码 === '') {
      初始密码 = randomBytes(6).toString('hex') // 生成 12 位随机 16 进制字符串
      密码是生成的 = true
    }

    let 初始用户id = randomUUID()

    // 检查管理员是否存在
    let 用户存在判定 = await kysely管理器
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('name', '=', 环境变量.DEFAULT_SYSTEM_USER)
      .executeTakeFirst()

    if (用户存在判定 === undefined) {
      await log.debug('创建管理员用户...')
      await kysely管理器.执行事务(async (trx) => {
        await trx
          .insertInto('user')
          .values({
            id: 初始用户id,
            name: 环境变量.DEFAULT_SYSTEM_USER,
            pwd: await bcrypt.hash(初始密码, 环境变量.BCRYPT_ROUNDS),
            is_admin: 1,
          })
          .execute()
        await trx.insertInto('user_config').values({ id: randomUUID(), user_id: 初始用户id, theme: '系统' }).execute()
      })
    }

    // 写入/更新系统配置
    await kysely管理器.获得句柄().deleteFrom('system_config').execute()
    await kysely管理器
      .获得句柄()
      .insertInto('system_config')
      .values({ id: randomUUID(), is_initialized: 1, enable_register: 0, version: version, jwt_secret: jwt密钥 })
      .execute()

    if (密码是生成的) {
      console.log('\n' + '='.repeat(50))
      console.log('🚀 系统初始化完成！')
      console.log(`管理员账号: ${环境变量.DEFAULT_SYSTEM_USER}`)
      console.log(`初始随机密码: ${初始密码}`)
      console.log('请务必妥善保管并及时修改密码！')
      console.log('='.repeat(50) + '\n')
    }
    await log.debug('初始化流程结束')
  } else if (系统数据.version !== version) {
    await log.debug('初始化标记已存在, 且版本不一致, 开始升级流程...')
    // 预期的外部逻辑中:
    // - 如果数据库文件不存在, 就会使用 prisma 创建默认数据库
    // - 如果数据库文件已存在, 就不会调用 prisma, 即使是兼容的迁移也不会执行
    //
    // 这里需要手动执行 sql 来升级, 这是合理的, 因为 prisma 迁移很容易出现无法兼容的迁移
    // 即使是兼容的迁移, 也不要在这里通过 exec 执行 prisma 命令, 因为命令会一次应用所有迁移, 而我们无法保证未来的迁移是否兼容
    //
    // 每次升级应该确认数据库版本和程序版本, 阶梯升级
    // 例如从 0.0.1 版本升级到 0.0.3 版本, 流程是:
    // - 系统启动, 发现代码版本号 0.0.3, 数据库版本号, 0.0.1
    // - 代码执行 0.0.1 升级到 0.0.2 的逻辑
    // - 自动重启
    // - 系统启动, 发现代码版本号 0.0.3, 数据库版本号, 0.0.2
    // - 代码执行 0.0.2 升级到 0.0.3 的逻辑
    // - 自动重启
    // - 系统启动, 发现代码版本号 0.0.3, 数据库版本号, 0.0.3
    // - 正常启动
    await log.debug('升级流程结束')
  } else {
    await log.debug('初始化标记已存在, 且版本一致, 正常启动')
  }
}
