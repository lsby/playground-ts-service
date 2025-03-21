import React, { useContext, useEffect, useState } from 'react'
import { 上下文描述 } from '../ctx/ctx'
import { 演示页 } from './page/demo'
import { 登录页 } from './page/login'
import { 页面未找到 } from './page/page-not-find'

export type 页面们 = '/' | '/login' | '/demo'

export function App(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)
  let [已登录, 设置已登录] = useState(上下文.客户端.已登录())
  let [当前路径, 设置当前路径] = useState(window.location.pathname)

  useEffect(() => {
    let 当地址改变 = (): void => {
      设置已登录(上下文.客户端.已登录())
      设置当前路径(window.location.pathname)
    }
    window.addEventListener('popstate', 当地址改变)
    return (): void => window.removeEventListener('popstate', 当地址改变)
  }, [上下文.客户端])

  if (已登录 === false && 当前路径 !== '/login') {
    上下文.重定向到页面('/login')
    location.reload()
    return <p>等待跳转...</p>
  }

  let 页面组件: Record<页面们, React.JSX.Element> = {
    '/': <演示页 />,
    '/login': <登录页 />,
    '/demo': <演示页 />,
  }

  let 选择的页面 = (页面组件 as Record<string, React.JSX.Element>)[当前路径] ?? <页面未找到 />

  return <上下文描述.Provider value={上下文}>{选择的页面}</上下文描述.Provider>
}
