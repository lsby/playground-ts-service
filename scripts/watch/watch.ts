import { execSync } from 'child_process'
import nodeWatch from 'node-watch'
import * as path from 'path'

let 参数 = process.argv.slice(2)
let 监控路径 = 参数[0]
let 命令 = 参数[1]

if (监控路径 === undefined || 监控路径.length === 0) throw new Error('没有提供监视路径')
if (命令 === undefined || 命令.length === 0) throw new Error('没有提供命令')

function 任务(): void {
  console.log('========生成开始========')
  try {
    console.log('执行', 命令)
    execSync(`${命令}`, { stdio: 'inherit' })
  } catch (e: unknown) {
    console.error(`错误: ${String(e)}`)
  }
  console.log('========生成结束========')
}
任务()

let 定时器句柄: NodeJS.Timeout | undefined
let 状态: '执行中' | '空闲中' | '等待稍后执行' = '空闲中'
let 延时 = 1000
let 执行堆积 = false
nodeWatch(
  path.resolve(监控路径),
  {
    recursive: true,
    filter: (name) => {
      console.log('文件变化: ' + name)

      return true
    },
  },
  function () {
    switch (状态) {
      case '执行中':
        console.log('正在执行中, 本次事件将会在稍后执行')
        执行堆积 = true
        return
      case '等待稍后执行':
        console.log('正在等待稍后执行, 本次事件将会在稍后与当前事件一并执行')
        if (定时器句柄 !== undefined) clearTimeout(定时器句柄)
        break
      case '空闲中':
        console.log('正在空闲中, 本次事件将会在稍后执行')
        状态 = '等待稍后执行'
        break
    }

    定时器句柄 = setTimeout(function f() {
      状态 = '执行中'
      任务()
      状态 = '空闲中'
      if (执行堆积 === true) {
        执行堆积 = false
        setTimeout(() => f(), 0)
      }
    }, 延时)
  },
)
