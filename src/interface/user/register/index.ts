import { 常用形式接口封装, 接口逻辑 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { z } from 'zod'
import { Global } from '../../../global/global'
import { 检查用户名 } from '../../../logic/check/check-user-name'
import { 检查密码 } from '../../../logic/check/check-user-pwd'
import { 注册逻辑 } from '../../../logic/components/register'

let 接口路径 = '/api/user/register' as const
let 接口方法 = 'post' as const

let 接口实现 = 接口逻辑
  .空逻辑()
  .混合(检查用户名('userName'))
  .混合(检查密码('userPassword'))
  .混合(注册逻辑('userName', 'userPassword', [new Task(async () => await Global.getItem('kysely-plugin'))]))

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

export default new 常用形式接口封装(接口路径, 接口方法, 接口实现, 接口错误类型描述, 接口正确类型描述)
