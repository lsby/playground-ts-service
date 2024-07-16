import { Log } from '@lsby/ts-log'
import { Flex布局, 按钮, 文本, 空事件监听, 输入框 } from '@lsby/ts-web-frame'
import { GlobalWeb } from './global-web/global-web'

async function main(): Promise<void> {
  var log = new Log('web')
  localStorage['debug'] = '*'

  const 挂载容器 = document.getElementById('app')
  if (挂载容器 == null) throw new Error('没有找到容器')

  var 输入框组件1: 输入框 = new 输入框({ 内容: '你好世界1' }, async (输入事件) =>
    输入框组件1.修改数据(输入事件.获得事件数据()),
  )
  var 输入框组件2 = new 输入框({ 内容: '你好世界2' }, 空事件监听)

  var 设置文本按钮 = new 按钮({ 文本: '设置文本' }, async () => {
    await log.debug('点击按钮1')
    await 输入框组件2.修改数据(输入框组件1.获得数据())
  })
  var 设置输入框按钮 = new 按钮({ 文本: '设置输入框' }, async () => {
    await log.debug('点击按钮2')
    await 输入框容器.修改组件([输入框组件2, 输入框组件2])
  })

  var 输入框容器 = new Flex布局({ 主轴方向: '左右', 主轴项对齐方式: '起点' }, [输入框组件2])
  var 主容器 = new Flex布局({ 宽度: '100%', 高度: '100%', 主轴项对齐方式: '居中', 交叉轴项对齐方式: '居中' }, [
    new Flex布局({ 主轴方向: '上下', 高度: '100%', 主轴项对齐方式: '居中' }, [
      new Flex布局({ 主轴方向: '上下', 交叉轴项对齐方式: '起点' }, [
        new 文本({ 文本: '这两个输入框会一起变化:' }),
        new Flex布局({ 主轴方向: '左右', 主轴项对齐方式: '居中' }, [输入框组件1, 输入框组件1]),
      ]),
      new Flex布局({ 主轴方向: '上下' }, [
        new 文本({ 文本: '点击按钮后, 下面的输入框会和上面输入框的内容一致:' }),
        输入框容器,
        new Flex布局({ 主轴方向: '左右', 主轴项对齐方式: '居中' }, [设置文本按钮]),
      ]),
      new Flex布局({ 主轴方向: '上下' }, [
        new 文本({ 文本: '点击按钮后, 上面的输入框会变成两个' }),
        new Flex布局({ 主轴方向: '左右', 主轴项对齐方式: '居中' }, [设置输入框按钮]),
      ]),
      new Flex布局({ 主轴方向: '左右', 主轴项对齐方式: '居中' }, [
        new 按钮({ 文本: '测试后端请求' }, async () => {
          var 客户端 = await GlobalWeb.getItem('后端客户端')
          var r = await 客户端.post('/api/base/add', { a: 1, b: 2 })
          await log.debug('请求结果: %o', r)
        }),
      ]),
    ]),
  ])

  主容器.挂载(挂载容器).catch(console.error)
}
main().catch(console.error)
