import { spawn } from 'child_process'

function 启动任务(): void {
  const 子进程 = spawn('npm', ['run', '_clear:web'], { stdio: 'inherit', shell: true })

  子进程.on('close', (代码: number | null) => {
    if (代码 !== 0) {
      console.error('清理脚本失败，退出码:', 代码)
      重启()
      return
    }

    const parcel进程 = spawn(
      'parcel',
      [
        '--no-cache',
        '--dist-dir',
        'dist/web',
        '--watch-for-stdin',
        '--port',
        '4000',
        '--hmr-port',
        '4001',
        'src/web/page/**/*.html',
      ],
      { stdio: 'inherit', shell: true },
    )

    parcel进程.on('close', () => {
      console.log('崩了！重启！')
      setTimeout(() => 重启(), 1000)
    })
  })
}

function 重启(): void {
  启动任务()
}

启动任务()
