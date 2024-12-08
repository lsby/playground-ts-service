import { JSON状态接口类型, JSON解析插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'

export default new JSON状态接口类型(
  '/api/user/register',
  'post',
  [
    new Task(async () => {
      return await Global.getItem('kysely-plugin')
    }),
    new Task(async () => {
      return new JSON解析插件(
        z.object({
          name: z.string(),
          pwd: z.string(),
        }),
        {},
      )
    }),
  ],
  z.object({}),
  z.enum([
    '用户名已存在',
    '用户名或密码不能包含空格',
    '用户名或密码不能为空',
    '用户名过短',
    '用户名过长',
    '密码过短',
    '密码过长',
  ]),
)
