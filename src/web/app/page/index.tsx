import React, { useContext } from 'react'
import { 上下文描述 } from '../../ctx/ctx'
import { 计算器 } from '../components/calculator'
import { WS测试组件 } from '../components/ws-test'

export function 主页(): React.JSX.Element {
  const 上下文 = useContext(上下文描述)

  return (
    <>
      <计算器></计算器>
      <WS测试组件></WS测试组件>
      <div>
        <button onClick={退出登录} className="p-2 bg-blue-500 text-white border-none rounded">
          退出登录
        </button>
      </div>
    </>
  )

  async function 退出登录(): Promise<void> {
    await 上下文.客户端.退出登录()
    window.location.reload()
  }
}
