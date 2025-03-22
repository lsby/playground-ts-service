import React, { useContext, useState } from 'react'
import { 上下文描述 } from '../../ctx/ctx'

export function WS测试组件(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)

  let [文本值, 设置文本值] = useState('')
  let [ws句柄, 设置ws句柄] = useState<WebSocket | null>(null)

  return (
    <div>
      <textarea value={文本值} readOnly></textarea>
      <br />
      <button
        style={{
          margin: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#45a049'
        }}
        onMouseLeave={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#4CAF50'
        }}
        onClick={async function () {
          await 上下文.客户端.post(
            '/api/base/ws-test',
            {},
            function (data) {
              设置文本值(data.data)
            },
            void 0,
            void 0,
            (f) => 设置ws句柄(f),
          )
        }}
      >
        开始测试WS
      </button>
      <button
        style={{
          margin: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#45a049'
        }}
        onMouseLeave={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#4CAF50'
        }}
        onClick={async function () {
          ws句柄?.close()
        }}
      >
        断开WS连接
      </button>
    </div>
  )
}
