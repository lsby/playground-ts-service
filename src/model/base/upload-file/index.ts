import { JSON状态接口, 计算JSON状态接口返回, 计算接口参数 } from '@lsby/net-core'
import { Right } from '@lsby/ts-fp-data'
import { Global } from '../../../global/global'
import { 接口描述 } from './type'

type 接口描述类型 = typeof 接口描述

export class 文件上传 extends JSON状态接口<接口描述类型> {
  override 获得接口类型(): 接口描述类型 {
    return 接口描述
  }
  protected override async 业务行为实现(参数: 计算接口参数<接口描述类型>): 计算JSON状态接口返回<接口描述类型> {
    var log = (await Global.getItem('log')).extend('upload-file')
    await log.debug('上传的文件信息: %j', 参数.files)
    return new Right({})
  }
}
