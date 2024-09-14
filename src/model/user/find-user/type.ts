import { Kysely } from 'kysely'
import { DB, user } from '../../../types/db'

export type 输入 = {
  用户名: string
  kysely: Kysely<DB>
}
export type 输出 = {
  用户: user | null
}
export type 错误 = never
