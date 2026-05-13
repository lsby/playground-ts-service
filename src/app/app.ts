import { 接口, 接口逻辑, 服务器, 自定义接口返回器, 路径解析插件, 静态文件返回器 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import path from 'path'
import { z } from 'zod'
import { 环境变量 } from '../global/env'
import { globalLog, syncLogCallBack, 即时任务管理器, 定时任务管理器 } from '../global/global'
import { interfaceApiList } from '../interface/interface-list'
import { 报告系统情况任务 } from '../job/instant-job/report-system-status'
import { databaseBackupCron } from '../job/scheduled-job/database-backup'
import { onTimeAlarm } from '../job/scheduled-job/on-time-alarm'

export class App {
  public async run(): Promise<void> {
    let log = globalLog.extend('service')
    await 定时任务管理器.执行([onTimeAlarm, databaseBackupCron])

    let 服务 = new 服务器({
      接口们: [
        ...interfaceApiList,
        new 接口(
          '/favicon.ico',
          'get',
          接口逻辑.构造([], async () => new Right({})),
          new 自定义接口返回器(z.never(), z.object({}), z.string(), z.object({}), (req, res, _data) => {
            res.statusCode = 404
            return res.end()
          }),
        ),
        new 接口(
          new RegExp('/public/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 项目根路径: string
            switch (环境变量.CODE_LAYOUT) {
              case 'source':
                项目根路径 = path.join(import.meta.dirname, '../../')
                break
              case 'dist':
                项目根路径 = path.join(import.meta.dirname, '../../../')
                break
              case 'flat':
                项目根路径 = path.join(import.meta.dirname, './')
                break
            }
            let 基础路径 = path.join(项目根路径, 'public')
            let 目标文件路径 = path.resolve(
              基础路径,
              参数.path.file.startsWith('/') ? 参数.path.file.slice(1) : 参数.path.file,
            )
            let 校验基础路径 = 基础路径.endsWith(path.sep) ? 基础路径 : 基础路径 + path.sep
            if (!目标文件路径.startsWith(校验基础路径) && 目标文件路径 !== 基础路径) {
              return new Right({ filePath: path.join(基础路径, 'not-found') })
            }
            return new Right({ filePath: 目标文件路径 })
          }),
          new 静态文件返回器({}),
        ),
        new 接口(
          new RegExp('/.*'),
          'get',
          接口逻辑.构造([new 路径解析插件()], async (参数) => {
            let 相对路径 = 参数.path.rawPath === '/' ? '/index.html' : 参数.path.rawPath
            let 项目根路径: string
            switch (环境变量.CODE_LAYOUT) {
              case 'source':
                项目根路径 = path.join(import.meta.dirname, '../../')
                break
              case 'dist':
                项目根路径 = path.join(import.meta.dirname, '../../../')
                break
              case 'flat':
                项目根路径 = path.join(import.meta.dirname, './')
                break
            }
            let 网页资源根目录 = path.join(项目根路径, 'dist/src/web')
            let 目标文件路径 = path.resolve(网页资源根目录, 相对路径.startsWith('/') ? 相对路径.slice(1) : 相对路径)
            let 校验网页资源根目录 = 网页资源根目录.endsWith(path.sep) ? 网页资源根目录 : 网页资源根目录 + path.sep
            if (!目标文件路径.startsWith(校验网页资源根目录) && 目标文件路径 !== 网页资源根目录) {
              return new Right({ filePath: path.join(网页资源根目录, 'index.html') })
            }
            return new Right({ filePath: 目标文件路径 })
          }),
          new 静态文件返回器({}),
        ),
      ],
      端口: 环境变量.APP_PORT,
      日志回调: syncLogCallBack,
    })
    let 服务信息 = await 服务.run()

    await log.debug('已加载的api路径: %O', 服务信息.api)
    await log.debug('服务器地址: %O', 服务信息.ip)

    即时任务管理器.提交任务(报告系统情况任务)
  }
}
