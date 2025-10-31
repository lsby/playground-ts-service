export type ws操作类型 = {
  发送ws信息: (args_0: { message: string }) => Promise<void>
  关闭ws连接: () => Promise<void>
  设置清理函数: (args_0: () => Promise<void>) => Promise<void>
} | null
