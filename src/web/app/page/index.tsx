import React from 'react'
import { useTable } from '../../global/global'
import { 计算器 } from '../components/calculator'
import { 注销按钮 } from '../components/logout'
import { WS测试组件 } from '../components/ws-test'

export function 主页(): React.JSX.Element {
  let [用户信息表] = useTable('/table/user-info', {})

  if (用户信息表 === null) return <div>加载中...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-indigo-900 to-black space-y-12">
      <div
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl flex justify-center items-center"
        style={{
          backgroundColor: '#FF4081', // 粉红色背景
          boxShadow: '0 10px 30px rgba(255, 64, 129, 0.3)',
        }}
      >
        <p className="text-4xl font-extrabold text-white text-center drop-shadow-lg">欢迎您: {用户信息表[0]?.name}</p>
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
        <注销按钮 />
      </div>
    </div>
  )
}
