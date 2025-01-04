import React from 'react'
import { 页面们 } from '../app/app'
import { GlobalWeb, 后端客户端 } from '../global/global'

export type 上下文类型 = {
  客户端: 后端客户端
  导航到页面: (page: 页面们 | `${页面们}?${any}`) => void
  重定向到页面: (page: 页面们 | `${页面们}?${any}`) => void
}

export let 上下文描述 = React.createContext<上下文类型>({
  客户端: await (await GlobalWeb.getItem('后端客户端')).初始化(),
  导航到页面: (page: 页面们 | `${页面们}?${any}`) => {
    window.history.pushState({}, '', page)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
  重定向到页面: (page: 页面们 | `${页面们}?${any}`) => {
    window.history.replaceState({}, '', page)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
})
