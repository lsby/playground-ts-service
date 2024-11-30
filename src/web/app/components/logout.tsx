import React, { useContext } from 'react'
import { 上下文描述 } from '../../ctx/ctx'

export function 注销按钮(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)

  return (
    <button
      onClick={async () => {
        await 上下文.客户端.退出登录()
        window.location.reload()
      }}
      className="p-2 bg-blue-500 text-white border-none rounded"
    >
      退出登录
    </button>
  )
}
