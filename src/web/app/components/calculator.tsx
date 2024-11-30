import React, { useState } from 'react'
import { usePost } from '../../global/global'

export function 计算器(): React.JSX.Element {
  let [数字a, 设置数字a] = useState<number>(1)
  let [数字b, 设置数字b] = useState<number>(2)
  let [数据, _刷新数据, _设置正确数据, _设置错误数据] = usePost('/api/base/add', { a: 数字a, b: 数字b })

  let 更新数字a = (e: React.ChangeEvent<HTMLInputElement>): void => 设置数字a(Number(e.target.value))
  let 更新数字b = (e: React.ChangeEvent<HTMLInputElement>): void => 设置数字b(Number(e.target.value))

  if (数据 == null) return <div>加载中...</div>
  if (数据.status === 'fail') return <div>发生错误: {数据.data}</div>

  return (
    <div>
      <div className="mb-4">
        <span>数字 a: </span>
        <input type="number" value={数字a} onChange={更新数字a} placeholder="输入数字 a" className="ml-2 p-1 w-24" />
      </div>
      <div className="mb-4">
        <span>数字 b: </span>
        <input type="number" value={数字b} onChange={更新数字b} placeholder="输入数字 b" className="ml-2 p-1 w-24" />
      </div>
      <p className="text-lg mb-5">a + b 的结果: {数据.data.res}</p>
    </div>
  )
}
