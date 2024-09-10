import { 包装的正确JSON结果, 接口抽象类, 计算实现参数, 计算实现结果 } from '@lsby/net-core'
import { Global } from '../../../global/global'
import 接口类型定义 from './type'

export class 接口实现 extends 接口抽象类<typeof 接口类型定义> {
  override 获得类型(): typeof 接口类型定义 {
    return 接口类型定义
  }
  override async 调用(ctx: 计算实现参数<typeof 接口类型定义>): 计算实现结果<typeof 接口类型定义> {
    var log = (await Global.getItem('log')).extend('upload-file')

    await log.debug('上传的文件信息: %j', ctx.files)

    return new 包装的正确JSON结果({})
  }
}

export default new 接口实现()
