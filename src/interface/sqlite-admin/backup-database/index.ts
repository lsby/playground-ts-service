import {
  WebSocket插件,
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import fs from 'fs'
import { CompiledQuery } from 'kysely'
import path from 'path'
import { z } from 'zod'
import { 环境变量 } from '../../../global/env'
import { jwt插件, kysely插件 } from '../../../global/plugin'
import { 检查管理员登录 } from '../../../interface-logic/check/check-login-jwt-admin'

let 接口路径 = '/api/sqlite-admin/backup-database' as const
let 接口方法 = 'post' as const

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(new 检查管理员登录([jwt插件.解析器, kysely插件], () => ({ 表名: 'user', id字段: 'id', 标识字段: 'is_admin' })))
  .混合(
    接口逻辑.构造([], async (_参数, _逻辑附加参数, _请求附加参数) => {
      return new Right({ isAuto: false })
    }),
  )
  .混合(
    接口逻辑.构造(
      [kysely插件, new WebSocket插件(z.object({ message: z.string() }))],
      async (参数, 逻辑附加参数, 请求附加参数) => {
        let _log = 请求附加参数.log
          .extend(接口路径)
          .pipe(async (level, namespace, content) =>
            参数.ws操作?.发送ws信息({ message: `[${level}] [${namespace}] ${content}` }),
          )

        let kysely = 参数.kysely.获得句柄()

        await _log.info('开始备份数据库...')

        // 获取备份目录
        let backupDir = 环境变量.DB_BACKUP_PATH
        await _log.info(`备份目录: ${backupDir}`)

        // 生成备份文件名：前缀_环境_时间
        let envName = 环境变量.NODE_ENV
        let timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]
        let backupFileName = `${环境变量.DB_BACKUP_PREFIX}${逻辑附加参数.isAuto ? 环境变量.DB_BACKUP_AUTO_PREFIX : ''}${envName}_${timestamp}.db`
        let backupPath = path.join(backupDir, backupFileName)
        await _log.info(`备份文件路径: ${backupPath}`)

        // 确保备份目录存在
        await fs.promises.mkdir(backupDir, { recursive: true })
        await _log.info('备份目录已创建或已存在')

        // 使用VACUUM INTO进行备份
        await _log.info('开始执行VACUUM INTO备份...')
        await kysely.executeQuery(CompiledQuery.raw(`VACUUM INTO '${backupPath}';`, []))
        await _log.info('备份完成')

        return new Right({})
      },
    ),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum(['未登录', '非管理员'])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)

export let 备份数据库 = 接口逻辑实现.获得最后接口()
