import React from 'react'
import { 计算器 } from '../components/calculator'
import { 注销按钮 } from '../components/logout'
import { WS测试组件 } from '../components/ws-test'

export function 主页(): React.JSX.Element {
  return (
    <div className="text-center m-5">
      <div className="mb-4 p-4" style={{ backgroundColor: '#FF6347' }}>
        <计算器></计算器>
      </div>
      <div className="mb-4 p-4" style={{ backgroundColor: '#FFD700' }}>
        <WS测试组件></WS测试组件>
      </div>
      <div className="mb-4 p-4" style={{ backgroundColor: '#32CD32' }}>
        <注销按钮></注销按钮>
      </div>
    </div>
  )
}
