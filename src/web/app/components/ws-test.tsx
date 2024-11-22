import React, { useContext, useState } from 'react'
import { 上下文描述 } from '../../ctx/ctx'

export function WS测试组件(): React.JSX.Element {
  const 上下文 = useContext(上下文描述)

  var [文本值, 设置文本值] = useState('')

  return (
    <>
      <textarea value={文本值} readOnly></textarea>
      <button
        onClick={async () => {
          await 上下文.客户端.post('/api/base/ws-test', {}, (data) => {
            设置文本值(data.data)
          })
        }}
      >
        开始测试
      </button>
    </>
  )
}
