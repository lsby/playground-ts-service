import {
  常用形式接口封装,
  接口逻辑,
  计算接口逻辑JSON参数,
  计算接口逻辑正确结果,
  计算接口逻辑错误结果,
} from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 检查唯一性 } from '../../../interfece-logic/check/check-exist'
import { 检查用户名 } from '../../../interfece-logic/check/check-user-name'
import { 检查密码 } from '../../../interfece-logic/check/check-user-pwd'
import { 注册逻辑 } from '../../../interfece-logic/components/register'

let 接口路径 = '/api/user/register' as const
let 接口方法 = 'post' as const

let 用户表 = z.object({
  id: z.string(),
  name: z.string(),
  pwd: z.string(),
})

let 接口逻辑实现 = 接口逻辑
  .空逻辑()
  .混合(new 检查用户名('userName'))
  .混合(new 检查密码('userPassword'))
  .混合(
    new 检查唯一性({
      表名: 'user',
      表结构zod: 用户表,
      数据库字段名: 'name',
      参数字段名: 'userName',
      错误信息: '用户名已存在' as const,
      kysely插件: new Task(async () => await Global.getItem('kysely-plugin')),
    }),
  )
  .混合(
    new 注册逻辑(new Task(async () => await Global.getItem('kysely-plugin')), 'user', async (data) => ({
      id: randomUUID(),
      name: data.userName,
      pwd: await bcrypt.hash(data.userPassword, 10),
    })),
  )

type _接口逻辑JSON参数 = 计算接口逻辑JSON参数<typeof 接口逻辑实现>
type _接口逻辑错误返回 = 计算接口逻辑错误结果<typeof 接口逻辑实现>
type _接口逻辑正确返回 = 计算接口逻辑正确结果<typeof 接口逻辑实现>

let 接口错误类型描述 = z.enum([
  '用户名已存在',
  '用户名不能包含空格',
  '用户名不能为空',
  '用户名过短',
  '用户名过长',
  '密码不能包含空格',
  '密码不能为空',
  '密码过短',
  '密码过长',
])
let 接口正确类型描述 = z.object({})

export default new 常用形式接口封装(接口路径, 接口方法, 接口逻辑实现, 接口错误类型描述, 接口正确类型描述)
