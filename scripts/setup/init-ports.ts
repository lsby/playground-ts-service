import * as fs from 'fs'
import * as net from 'net'
import * as path from 'path'

/**
 * 寻找一个可用的空闲端口
 */
async function 获取空闲端口(起始端口: number = 30000): Promise<number> {
  return new Promise((解决) => {
    let 服务器 = net.createServer()
    服务器.unref()
    服务器.on('error', () => {
      // 端口被占用或无法绑定，尝试下一个
      解决(获取空闲端口(起始端口 + 1))
    })
    服务器.listen(起始端口, () => {
      let 端口 = (服务器.address() as net.AddressInfo).port
      服务器.close(() => {
        解决(端口)
      })
    })
  })
}

/**
 * 替换指定 .env 文件中的端口号
 */
async function 替换文件中的端口(文件相对路径: string, 变量名: string, 新端口: number): Promise<void> {
  let 绝对路径 = path.resolve(import.meta.dirname, '../../', 文件相对路径)
  if (!fs.existsSync(绝对路径)) {
    console.warn(`文件不存在，跳过: ${文件相对路径}`)
    return
  }

  let 内容 = fs.readFileSync(绝对路径, 'utf8')
  // 匹配形如 `变量名 = 3000` 或 `变量名=3000`，只修改整行
  let 正则 = new RegExp(`^(${变量名}\\s*=\\s*)\\d+`, 'm')

  if (正则.test(内容)) {
    let 新内容 = 内容.replace(正则, `$1${新端口}`)
    fs.writeFileSync(绝对路径, 新内容, 'utf8')
    console.log(`[OK] 已将 ${文件相对路径} 中的 ${变量名} 更新为 ${新端口}`)
  } else {
    // 如果没有找到对应的变量，也提示一下
    console.log(`[IGNORE] 在 ${文件相对路径} 中未找到 ${变量名}`)
  }
}

async function 主函数(): Promise<void> {
  console.log('🚀 开始为项目分配新的随机端口...')

  // 为了避免一直从30000开始找导致多个新项目依然挨得很近，我们加一点随机起始偏移
  let 随机偏移 = Math.floor(Math.random() * 10000)

  // 寻找需要的端口
  let appPort = await 获取空闲端口(30000 + 随机偏移)
  let webPort = await 获取空闲端口(appPort + 1)
  let webHmrPort = await 获取空闲端口(webPort + 1)
  let testAppPort = await 获取空闲端口(webHmrPort + 1)
  let testWebPort = await 获取空闲端口(testAppPort + 1)
  let testWebHmrPort = await 获取空闲端口(testWebPort + 1)

  console.log('=============================================')
  console.log(`分配结果:`)
  console.log(`- APP_PORT      => ${appPort}`)
  console.log(`- WEB_PORT      => ${webPort}`)
  console.log(`- WEB_HMR_PORT  => ${webHmrPort}`)
  console.log(`- TEST_APP_PORT => ${testAppPort}`)
  console.log(`- TEST_WEB_PORT => ${testWebPort}`)
  console.log(`- TEST_WEB_HMR_PORT => ${testWebHmrPort}`)
  console.log('=============================================\n')

  // 将要处理的环境文件列表
  let env文件列表 = [
    '.env/.env.development.electron',
    '.env/.env.development.pure-frontend',
    '.env/.env.development.web',
    '.env/.env.production.electron',
    '.env/.env.production.pure-frontend',
    '.env/.env.production.sea',
    '.env/.env.production.web',
  ]

  // 更新常规开发/生产环境
  for (let env文件 of env文件列表) {
    await 替换文件中的端口(env文件, 'APP_PORT', appPort)
    await 替换文件中的端口(env文件, 'WEB_PORT', webPort)
    await 替换文件中的端口(env文件, 'WEB_HMR_PORT', webHmrPort)
  }

  // 独立更新测试环境
  await 替换文件中的端口('.env/.env.test.web', 'APP_PORT', testAppPort)
  await 替换文件中的端口('.env/.env.test.web', 'WEB_PORT', testWebPort)
  await 替换文件中的端口('.env/.env.test.web', 'WEB_HMR_PORT', testWebHmrPort)

  // 更新 Docker 配置文件
  let dockerFiles = [
    {
      compose: path.resolve(import.meta.dirname, '../../deploy/development/docker-compose.yml'),
      dockerfile: path.resolve(import.meta.dirname, '../../deploy/development/dockerfile'),
    },
    {
      compose: path.resolve(import.meta.dirname, '../../deploy/production/docker-compose.yml'),
      dockerfile: path.resolve(import.meta.dirname, '../../deploy/production/dockerfile'),
    },
  ]

  for (let env of dockerFiles) {
    try {
      if (fs.existsSync(env.compose)) {
        let content = fs.readFileSync(env.compose, 'utf8')
        // 将 3000:xxxx 或 xxxx:xxxx 中的后一个端口替换为 appPort
        let replaced = content.replace(/(-\s*"?\d+:)\d+("?)/g, `$1${appPort}$2`)
        fs.writeFileSync(env.compose, replaced, 'utf8')
        console.log(`[OK] 已更新 ${env.compose} 中的容器端口`)
      }

      if (fs.existsSync(env.dockerfile)) {
        let content = fs.readFileSync(env.dockerfile, 'utf8')
        // 替换 EXPOSE 3000
        let replaced = content.replace(/^EXPOSE\s+\d+/gm, `EXPOSE ${appPort}`)
        fs.writeFileSync(env.dockerfile, replaced, 'utf8')
        console.log(`[OK] 已更新 ${env.dockerfile} 中的 EXPOSE 端口`)
      }
    } catch (err) {
      console.warn('[WARN] 更新 Docker 配置文件时出现问题:', err)
    }
  }

  console.log('\n✅ 端口初始化完成！由于已彻底解除硬编码，你的 E2E 测试、Docker 容器以及 HTTP 测试文件等都已自动生效。')
}

主函数().catch((错误) => {
  console.error(`💥 发生未处理的错误:`, 错误)
  process.exit(1)
})
