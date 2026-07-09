async function 主函数(): Promise<void> {
  console.log('这是一个集成测试示例')
  console.log('可以在这里编写调用后端接口、数据库操作等测试逻辑')
}

主函数().catch((错误) => {
  console.error(错误)
  process.exit(1)
})
