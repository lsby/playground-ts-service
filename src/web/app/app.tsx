import React, { useState } from 'react'
import { GlobalWeb } from '../global/global'

export function App(): React.JSX.Element {
  var [变量, 修改变量] = useState(NaN)

  return (
    <>
      <h1>Hello, world</h1>
      <p>{变量}</p>
      <button onClick={点击事件}>这是按钮</button>
    </>
  )

  async function 点击事件(): Promise<void> {
    var log = await GlobalWeb.getItem('log')
    var 客户端 = await GlobalWeb.getItem('后端客户端')
    var 请求结果 = await 客户端.post('/api/base/add', { a: 1, b: 2 })
    await log.debug('请求结果: %o', 请求结果)
    修改变量(请求结果.data.res)
  }
}
