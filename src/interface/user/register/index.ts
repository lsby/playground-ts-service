import { 常用形式转换器, 接口, 接口逻辑, 获得接口逻辑正确类型, 获得接口逻辑错误类型 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 注册接口组件 } from '../../../interface-components/register'
import { 检查用户名 } from '../../action/check-user-name'
import { 检查密码 } from '../../action/check-user-pwd'

let 接口路径 = '/api/user/register' as const
let 接口方法 = 'post' as const

let 逻辑错误类型Zod = z.enum([
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
let 逻辑正确类型Zod = z.object({})

let 逻辑实现 = new 注册接口组件([new Task(async () => await Global.getItem('kysely-plugin'))])
let 接口实现 = 接口逻辑.混合([new 检查用户名(), new 检查密码(), 逻辑实现])

let 接口错误输出形式 = z.object({ status: z.literal('fail'), data: 逻辑错误类型Zod })
let 接口正确输出形式 = z.object({ status: z.literal('success'), data: 逻辑正确类型Zod })
let 接口转换器 = new 常用形式转换器<获得接口逻辑错误类型<typeof 接口实现>, 获得接口逻辑正确类型<typeof 接口实现>>()
export default new 接口(接口路径, 接口方法, 接口实现, 接口错误输出形式, 接口正确输出形式, 接口转换器)
