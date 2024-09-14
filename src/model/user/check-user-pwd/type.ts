import { user } from '../../../types/db'

export type 输入 = {
  用户: user
  输入密码: string
}
export type 输出 = {}
export type 错误 = '密码错误'
