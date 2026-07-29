import { Env } from '@lsby/ts-env'
import { z } from 'zod'

export function getRawEnv<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.infer<z.ZodObject<T>> {
  return new Env({ 环境变量名称: 'ENV_FILE_PATH', 环境描述: schema }).获得环境变量()
}
