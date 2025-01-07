import React, { useContext } from 'react'
import { 上下文描述 } from '../../ctx/ctx'
import { useTable } from '../../global/global'
import { 计算器 } from '../components/calculator'
import { WS测试组件 } from '../components/ws-test'

export function 演示页(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)

  let [用户信息表数据] = useTable('/table/user-info', {})
  if (用户信息表数据.value === null) return <div>加载中...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-indigo-900 to-black space-y-12">
      <div
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl flex justify-center items-center"
        style={{
          backgroundColor: '#FF4081', // 粉红色背景
          boxShadow: '0 10px 30px rgba(255, 64, 129, 0.3)',
        }}
      >
        <p className="text-4xl font-extrabold text-white text-center drop-shadow-lg">
          欢迎您: {用户信息表数据.value[0]?.name}
        </p>
      </div>
      <div
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl flex justify-center items-center"
        style={{
          backgroundColor: '#00BCD4', // 蓝绿色背景
          boxShadow: '0 10px 30px rgba(0, 188, 212, 0.3)',
        }}
      >
        <计算器 />
      </div>
      <div
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl flex justify-center items-center"
        style={{
          backgroundColor: '#FF9800', // 橙黄色背景
          boxShadow: '0 10px 30px rgba(255, 152, 0, 0.3)',
        }}
      >
        <WS测试组件 />
      </div>
      <div
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl flex justify-center items-center"
        style={{
          backgroundColor: '#9C27B0', // 紫色背景
          boxShadow: '0 10px 30px rgba(156, 39, 176, 0.3)',
        }}
      >
        <button
          onClick={async () => {
            await 上下文.客户端.退出登录()
            上下文.重定向到页面('/')
          }}
          className="p-2 bg-blue-500 text-white border-none rounded"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
