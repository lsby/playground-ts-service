import { 主要按钮, 普通按钮 } from '../components/general/base/button'
import { 普通输入框 } from '../components/general/form/input'
import { 创建元素 } from './create-element'

export function 显示对话框(消息: string): Promise<void> {
  return new Promise((resolve) => {
    let 遮罩层 = 创建元素('div', {
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--遮罩颜色)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000',
      },
    })

    let 对话框 = 创建元素('div', {
      style: {
        backgroundColor: 'var(--卡片背景颜色)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        minWidth: '300px',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--边框颜色)',
      },
    })

    let 消息元素 = 创建元素('div', {
      textContent: 消息,
      style: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'var(--文字颜色)',
        whiteSpace: 'pre-wrap',
      },
    })

    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
      },
    })

    let 关闭对话框 = (): void => {
      document.body.removeChild(遮罩层)
      resolve()
    }

    let 确定按钮 = new 主要按钮({
      文本: '确定',
      点击处理函数: 关闭对话框,
    })
    // 遮罩层.addEventListener('click', (event: MouseEvent) => {
    //   if (event.target === 遮罩层) {
    //     关闭对话框()
    //   }
    // })

    // 支持 ESC 键关闭
    let 键盘处理 = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        关闭对话框()
        document.removeEventListener('keydown', 键盘处理)
      }
    }
    document.addEventListener('keydown', 键盘处理)

    按钮容器.appendChild(确定按钮)
    对话框.appendChild(消息元素)
    对话框.appendChild(按钮容器)
    遮罩层.appendChild(对话框)
    document.body.appendChild(遮罩层)

    // 自动聚焦到确定按钮
    setTimeout(() => {
      确定按钮.按钮聚焦()
    }, 0)
  })
}

export function 显示确认对话框(消息: string): Promise<boolean> {
  return new Promise((resolve) => {
    let 遮罩层 = 创建元素('div', {
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--遮罩颜色)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000',
      },
    })

    let 对话框 = 创建元素('div', {
      style: {
        backgroundColor: 'var(--卡片背景颜色)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        minWidth: '300px',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--边框颜色)',
      },
    })

    let 消息元素 = 创建元素('div', {
      textContent: 消息,
      style: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'var(--文字颜色)',
        whiteSpace: 'pre-wrap',
      },
    })

    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
      },
    })

    let 关闭对话框 = (结果: boolean): void => {
      document.body.removeChild(遮罩层)
      resolve(结果)
    }

    let 取消按钮 = new 普通按钮({
      文本: '取消',
      点击处理函数: (): void => {
        关闭对话框(false)
      },
    })

    let 确定按钮 = new 主要按钮({
      文本: '确定',
      点击处理函数: (): void => {
        关闭对话框(true)
      },
    })

    遮罩层.onclick = (event: MouseEvent): void => {
      if (event.target === 遮罩层) {
        关闭对话框(false)
      }
    }

    // 支持 ESC 键取消
    let 键盘处理 = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        关闭对话框(false)
        document.removeEventListener('keydown', 键盘处理)
      }
    }
    document.addEventListener('keydown', 键盘处理)

    按钮容器.appendChild(取消按钮)
    按钮容器.appendChild(确定按钮)
    对话框.appendChild(消息元素)
    对话框.appendChild(按钮容器)
    遮罩层.appendChild(对话框)
    document.body.appendChild(遮罩层)

    // 自动聚焦到确定按钮
    setTimeout(() => {
      确定按钮.按钮聚焦()
    }, 0)
  })
}

export function 显示输入对话框(消息: string, 默认值?: string): Promise<string | null> {
  return new Promise((resolve) => {
    let 遮罩层 = 创建元素('div', {
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--遮罩颜色)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000',
      },
    })

    let 对话框 = 创建元素('div', {
      style: {
        backgroundColor: 'var(--卡片背景颜色)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px var(--深阴影颜色)',
        minWidth: '300px',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--边框颜色)',
      },
    })

    let 消息元素 = 创建元素('div', {
      textContent: 消息,
      style: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'var(--文字颜色)',
        whiteSpace: 'pre-wrap',
      },
    })

    let 输入框 = new 普通输入框({
      占位符: '请输入内容',
      元素样式: { width: '100%' },
      ...(默认值 !== void 0 ? { 值: 默认值 } : {}),
    })

    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
      },
    })

    let 关闭对话框 = (结果: string | null): void => {
      document.body.removeChild(遮罩层)
      resolve(结果)
    }

    let 取消按钮 = new 普通按钮({
      文本: '取消',
      点击处理函数: (): void => {
        关闭对话框(null)
      },
    })

    let 确定按钮 = new 主要按钮({
      文本: '确定',
      点击处理函数: (): void => {
        关闭对话框(输入框.获得值())
      },
    })
    // 遮罩层.addEventListener('click', (event: MouseEvent) => {
    //   if (event.target === 遮罩层) {
    //     关闭对话框(null)
    //   }
    // })

    // 支持 ESC 键取消
    let 键盘处理 = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        关闭对话框(null)
        document.removeEventListener('keydown', 键盘处理)
      } else if (event.key === 'Enter') {
        关闭对话框(输入框.获得值())
        document.removeEventListener('keydown', 键盘处理)
      }
    }
    document.addEventListener('keydown', 键盘处理)

    按钮容器.appendChild(取消按钮)
    按钮容器.appendChild(确定按钮)
    对话框.appendChild(消息元素)
    对话框.appendChild(输入框)
    对话框.appendChild(按钮容器)
    遮罩层.appendChild(对话框)
    document.body.appendChild(遮罩层)

    // 自动聚焦到输入框
    setTimeout(() => {
      输入框.聚焦()
    }, 0)
  })
}
