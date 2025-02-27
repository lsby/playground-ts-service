import {
  分页选项,
  排序选项,
  接口逻辑,
  插件项类型,
  条件组,
  翻译修改值列描述,
  翻译列描述,
  翻译插入列描述,
  翻译查询列描述,
  虚拟表,
} from '@lsby/net-core'
import { Left, Right, Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../global/global'
import { 登录检查器 } from '../../interface-api/action/login-check'

let _构造类型 = z.object({})
let _列描述 = z.object({
  id: z.object({
    类型: z.literal('字符串'),
    可选: z.literal('true'),
    可空: z.literal('false'),
  }),
  name: z.object({
    类型: z.literal('字符串'),
    可选: z.literal('true'),
    可空: z.literal('false'),
  }),
})
let _增错误 = z.enum(['不允许'])
let _删错误 = z.enum(['未登录'])
let _改错误 = z.enum(['未登录'])
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

  override async 增(_数据们: 翻译插入列描述<列描述>[]): Promise<接口逻辑<插件项类型[], {}, 增错误类型, {}>> {
    return 接口逻辑.构造([], async (_参数) => new Left('不允许'))
  }
  override async 删(筛选条件: 条件组<翻译列描述<列描述>>): Promise<接口逻辑<插件项类型[], {}, 删错误类型, {}>> {
    return new 登录检查器().混合(
      接口逻辑.构造([new Task(async () => await Global.getItem('kysely-plugin'))], async (参数, 附加参数) => {
        let 构造 = 参数.kysely.deleteFrom('user')

        构造 = 构造.where('user.id', '=', 附加参数.userId)
        for (let 条件 of 筛选条件) {
          构造 = 构造.where(`user.${条件.列}`, 条件.符号, 条件.值)
        }

        await 构造.execute()
        return new Right({})
      }),
    )
  }
  override async 改(
    新值: Partial<翻译修改值列描述<列描述>>,
    筛选条件: 条件组<翻译列描述<列描述>>,
  ): Promise<接口逻辑<插件项类型[], {}, 改错误类型, {}>> {
    return new 登录检查器().混合(
      接口逻辑.构造([new Task(async () => await Global.getItem('kysely-plugin'))], async (参数, 附加参数) => {
        let 构造 = 参数.kysely.updateTable('user')

        for (let 设置值 of Object.entries(新值)) {
          构造 = 构造.set({ [设置值[0]]: 设置值[1] })
        }

        构造 = 构造.where('user.id', '=', 附加参数.userId)
        for (let 条件 of 筛选条件) {
          构造 = 构造.where(`user.${条件.列}`, 条件.符号, 条件.值)
        }

        await 构造.execute()
        return new Right({})
      }),
    )
  }
  override async 查(
    筛选条件?: 条件组<翻译列描述<列描述>>,
    分页条件?: 分页选项,
    排序条件?: 排序选项<keyof 列描述>,
  ): Promise<接口逻辑<插件项类型[], {}, 查错误类型, 翻译查询列描述<列描述>[]>> {
    return new 登录检查器().混合(
      接口逻辑.构造([new Task(async () => await Global.getItem('kysely-plugin'))], async (参数, 附加参数) => {
        let 构造 = 参数.kysely.selectFrom('user').select(['id', 'name'])

        构造 = 构造.where('user.id', '=', 附加参数.userId)
        if (筛选条件 !== void 0) {
          for (let 条件 of 筛选条件) {
            构造 = 构造.where(`user.${条件.列}`, 条件.符号, 条件.值)
          }
        }

        if (分页条件 !== void 0) {
          构造 = 构造.limit(分页条件.大小).offset((分页条件.页数 - 1) * 分页条件.大小)
        }

        if (排序条件 !== void 0) {
          构造 = 构造.orderBy(排序条件.排序列, 排序条件.排序模式 === '正序' ? 'asc' : 'desc')
        }

        let 查询结果 = await 构造.execute()
        return new Right(查询结果)
      }),
    )
  }
}

type 列形状 = typeof _列描述
type 列描述 = z.infer<列形状>
type 增错误类型 = z.infer<typeof _增错误>
type 删错误类型 = z.infer<typeof _删错误>
type 改错误类型 = z.infer<typeof _改错误>
type 查错误类型 = z.infer<typeof _查错误>
