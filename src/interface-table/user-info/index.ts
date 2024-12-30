import { 分页选项, 排序选项, 接口逻辑, 插件项类型, 条件组, 翻译列描述, 翻译列描述带空, 虚拟表 } from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../global/global'
import { 登录检查器 } from '../../interface-api/action/login-check'

let _构造类型 = z.object({})
let _列描述 = z.object({
  id: z.literal('字符串'),
  name: z.literal('字符串'),
})
let _增错误 = z.enum(['不允许'])
let _删错误 = z.enum(['不允许'])
let _改错误 = z.enum(['不允许'])
let _查错误 = z.enum(['未登录'])

export default class 我的模型 extends 虚拟表<
  typeof _构造类型,
  typeof _列描述,
  typeof _增错误,
  typeof _删错误,
  typeof _改错误,
  typeof _查错误
> {
  static override 资源路径 = '/table/user-info' as const

  override async 增(_数据们: Partial<列描述>[]): Promise<接口逻辑<插件项类型[], {}, 增错误类型, {}>> {
    return 接口逻辑.构造([], async (_参数) => new Left('不允许'))
  }
  override async 删(_筛选条件: 条件组<列定义>): Promise<接口逻辑<插件项类型[], {}, 删错误类型, {}>> {
    return 接口逻辑.构造([], async (_参数) => new Left('不允许'))
  }
  override async 改(
    _新值: Partial<列描述>,
    _筛选条件: 条件组<列定义>,
  ): Promise<接口逻辑<插件项类型[], {}, 改错误类型, {}>> {
    return 接口逻辑.构造([], async (_参数) => new Left('不允许'))
  }
  override async 查(
    _筛选条件?: 条件组<列定义>,
    _分页条件?: 分页选项,
    _排序条件?: 排序选项<列名们>,
  ): Promise<接口逻辑<插件项类型[], {}, 查错误类型, 翻译列描述带空<列描述>[]>> {
    return new 登录检查器().混合(
      接口逻辑.构造([new Task(async () => await Global.getItem('kysely-plugin'))], async (参数, 附加参数) => {
        let 查询结果 = await 参数.kysely
          .selectFrom('user')
          .select(['id', 'name'])
          .where('id', '=', 附加参数.userId)
          .execute()
        return new Right(查询结果)
      }),
    )
  }
}

type 列描述 = z.infer<typeof _列描述>
type 列定义 = 翻译列描述<列描述>
type 列名们 = keyof 列定义
type 增错误类型 = z.infer<typeof _增错误>
type 删错误类型 = z.infer<typeof _删错误>
type 改错误类型 = z.infer<typeof _改错误>
type 查错误类型 = z.infer<typeof _查错误>
