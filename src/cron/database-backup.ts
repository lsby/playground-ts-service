import { Cron抽象类 } from '@lsby/ts-cron'
import { promises as fs } from 'fs'
import path from 'path'
import { Global } from '../global/global'
import { 备份数据库 } from '../interface/sqlite-admin/backup-database'
import { 任务上下文, 任务抽象类 } from '../model/task/task'

export class 数据库备份任务 extends 任务抽象类<void> {
  public 获得任务名称(): string {
    return '数据库定时备份'
  }
  public 获得任务优先级(): number {
    return 1
  }
  public 获得任务超时时间(): number {
    return 0
  }
  public 获得最大重试次数(): number {
    return 2
  }

  public async 任务逻辑(上下文: 任务上下文): Promise<void> {
    let env = await Global.getItem('env').then((a) => a.获得环境变量())
    let kysely = await Global.getItem('kysely')
    let log = await Global.getItem('log').then((a) => a.extend('数据库备份任务'))

    let 管理员用户 = await kysely
      .获得句柄()
      .selectFrom('user')
      .select('id')
      .where('is_admin', '=', 1)
      .executeTakeFirst()
    if (管理员用户 === void 0) {
      throw new Error('没有管理员用户')
    }

    上下文.输出日志('备份开始')

    await 备份数据库.实现(
      {
        kysely: kysely,
      },
      { isAuto: true, userId: 管理员用户.id },
      { log: log },
    )

    上下文.输出日志('备份结束')

    await this.清理旧备份(env.DATABASE_BACKUP_PATH, env.DATABASE_BACKUP_RETENTION_DAYS, 上下文)
  }

  private async 清理旧备份(备份目录: string, 保留天数: number, 上下文: 任务上下文): Promise<number> {
    let 文件列表 = await fs.readdir(备份目录)
    let 备份文件列表: Array<{ 名称: string; 修改时间: Date }> = []
    let env = await Global.getItem('env').then((a) => a.获得环境变量())

    for (let 文件名 of 文件列表) {
      if (
        文件名.startsWith(`${env.DATABASE_BACKUP_PREFIX}${env.DATABASE_BACKUP_AUTO_PREFIX}`) &&
        文件名.endsWith('.db')
      ) {
        let 文件路径 = path.join(备份目录, 文件名)
        let 状态 = await fs.stat(文件路径)
        备份文件列表.push({
          名称: 文件名,
          修改时间: 状态.mtime,
        })
      }
    }

    // 按修改时间排序，最旧的在前
    备份文件列表.sort((a, b) => a.修改时间.getTime() - b.修改时间.getTime())

    let 当前时间 = new Date()
    let 保留时间阈值 = new Date(当前时间.getTime() - 保留天数 * 24 * 60 * 60 * 1000)

    let 删除数量 = 0
    for (let 备份文件 of 备份文件列表) {
      if (备份文件.修改时间 < 保留时间阈值) {
        let 文件路径 = path.join(备份目录, 备份文件.名称)
        await fs.unlink(文件路径)
        删除数量 = 删除数量 + 1
        上下文.输出日志(`删除旧备份文件：${备份文件.名称}`)
      } else {
        // 由于已排序，后面的文件都比这个新，停止检查
        break
      }
    }

    return 删除数量
  }
}

class 定时任务实现 extends Cron抽象类 {
  public override getName(): string {
    return '数据库备份'
  }
  public override async getCron(): Promise<`${string} ${string} ${string} ${string} ${string} ${string}`> {
    return '0 0 0 * * *' // 每天0点执行
  }
  public override async run(): Promise<void> {
    let log = await Global.getItem('log').then((a) => a.extend('数据库备份'))
    let env = await Global.getItem('env').then((a) => a.获得环境变量())

    // 只有当DB_TYPE为sqlite时才执行备份
    if (env.DB_TYPE !== 'sqlite') {
      log.debug('当前数据库类型为%o，跳过备份', env.DB_TYPE)
      return
    }

    try {
      log.debug('提交数据库备份任务')

      let 任务管理器 = await Global.getItem('task')
      let 备份任务 = new 数据库备份任务()
      let 任务id = 任务管理器.提交任务(备份任务)

      log.debug('数据库备份任务已提交，任务ID：%o', 任务id)
    } catch (错误) {
      log.error('提交数据库备份任务失败：%o', 错误)
    }
  }
}

export let databaseBackupCron = new 定时任务实现()
