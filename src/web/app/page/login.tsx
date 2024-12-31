import React, { useContext } from 'react'
import { 上下文描述 } from '../../ctx/ctx'

export function 登录页(): React.JSX.Element {
  let 上下文 = useContext(上下文描述)

  return (
    <div className="max-w-md mx-auto p-8 border border-gray-300 rounded-lg shadow-lg bg-gray-50">
      <h1 className="text-center mb-5 text-gray-800">登录</h1>
      <div>
        <div className="mb-5">
          <label htmlFor="用户名" className="block mb-2 font-bold">
            用户名:
          </label>
          <input
            type="text"
            id="用户名"
            name="用户名"
            required
            className="w-full p-2 rounded border border-gray-300 box-border"
            autoComplete="username"
          />
        </div>
        <div className="mb-5">
          <label htmlFor="密码" className="block mb-2 font-bold">
            密码:
          </label>
          <input
            type="password"
            id="密码"
            name="密码"
            required
            className="w-full p-2 rounded border border-gray-300 box-border"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
          onMouseOver={(e) => (e.currentTarget.className = 'w-full p-3 rounded bg-blue-700 text-white font-semibold')}
          onMouseOut={(e) => (e.currentTarget.className = 'w-full p-3 rounded bg-blue-600 text-white font-semibold')}
          onClick={登录按钮点击事件}
        >
          登录
        </button>
      </div>
    </div>
  )

  async function 登录按钮点击事件(_e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    let 用户名 = (document.getElementById('用户名') as HTMLInputElement).value
    let 密码 = (document.getElementById('密码') as HTMLInputElement).value

    let 结果 = await 上下文.客户端.登录(用户名, 密码)
    if (结果.status === 'fail') return alert(结果.data)
    上下文.重定向到页面('/')
  }
}
