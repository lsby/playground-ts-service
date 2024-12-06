import React, { useContext, useState } from 'react'
import { 上下文描述 } from '../ctx/ctx'
import { 主页 } from './page'
import { 登录页 } from './page/login'

export function App(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)
  let [已登录, 设置已登录] = useState(上下文.客户端.已登录())

  return (
    <上下文描述.Provider value={上下文}>
      {已登录 === false ? <登录页 on登录={() => 设置已登录(true)}></登录页> : <主页></主页>}
    </上下文描述.Provider>
  )
}
