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

    let 确定按钮 = 创建元素('button', {
      textContent: '确定',
      style: {
        padding: '8px 24px',
        backgroundColor: 'var(--主色调)',
        color: 'var(--卡片背景颜色)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      },
    })

    确定按钮.addEventListener('mouseenter', () => {
      确定按钮.style.opacity = '0.8'
    })
    确定按钮.addEventListener('mouseleave', () => {
      确定按钮.style.opacity = '1'
    })

    let 关闭对话框 = (): void => {
      document.body.removeChild(遮罩层)
      resolve()
    }

    确定按钮.addEventListener('click', 关闭对话框)
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
      确定按钮.focus()
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

    let 取消按钮 = 创建元素('button', {
      textContent: '取消',
      style: {
        padding: '8px 24px',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      },
    })

    取消按钮.addEventListener('mouseenter', () => {
      取消按钮.style.backgroundColor = 'var(--悬浮背景颜色)'
    })
    取消按钮.addEventListener('mouseleave', () => {
      取消按钮.style.backgroundColor = 'var(--按钮背景)'
    })

    let 确定按钮 = 创建元素('button', {
      textContent: '确定',
      style: {
        padding: '8px 24px',
        backgroundColor: 'var(--主色调)',
        color: 'var(--卡片背景颜色)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      },
    })

    确定按钮.addEventListener('mouseenter', () => {
      确定按钮.style.opacity = '0.8'
    })
    确定按钮.addEventListener('mouseleave', () => {
      确定按钮.style.opacity = '1'
    })

    let 关闭对话框 = (结果: boolean): void => {
      document.body.removeChild(遮罩层)
      resolve(结果)
    }

    取消按钮.addEventListener('click', () => {
      关闭对话框(false)
    })
    确定按钮.addEventListener('click', () => {
      关闭对话框(true)
    })
    遮罩层.addEventListener('click', (event: MouseEvent) => {
      if (event.target === 遮罩层) {
        关闭对话框(false)
      }
    })

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
      确定按钮.focus()
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

    let 输入框 = 创建元素('input', {
      type: 'text',
      style: {
        padding: '8px 12px',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'var(--输入框背景)',
        color: 'var(--输入框文字)',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
      },
    })

    if (默认值 !== void 0) {
      输入框.value = 默认值
    }

    输入框.addEventListener('focus', () => {
      输入框.style.borderColor = 'var(--主色调)'
    })
    输入框.addEventListener('blur', () => {
      输入框.style.borderColor = 'var(--边框颜色)'
    })

    let 按钮容器 = 创建元素('div', {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
      },
    })

    let 取消按钮 = 创建元素('button', {
      textContent: '取消',
      style: {
        padding: '8px 24px',
        backgroundColor: 'var(--按钮背景)',
        color: 'var(--按钮文字)',
        border: '1px solid var(--边框颜色)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      },
    })

    取消按钮.addEventListener('mouseenter', () => {
      取消按钮.style.backgroundColor = 'var(--悬浮背景颜色)'
    })
    取消按钮.addEventListener('mouseleave', () => {
      取消按钮.style.backgroundColor = 'var(--按钮背景)'
    })

    let 确定按钮 = 创建元素('button', {
      textContent: '确定',
      style: {
        padding: '8px 24px',
        backgroundColor: 'var(--主色调)',
        color: 'var(--卡片背景颜色)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      },
    })

    确定按钮.addEventListener('mouseenter', () => {
      确定按钮.style.opacity = '0.8'
    })
    确定按钮.addEventListener('mouseleave', () => {
      确定按钮.style.opacity = '1'
    })

    let 关闭对话框 = (结果: string | null): void => {
      document.body.removeChild(遮罩层)
      resolve(结果)
    }

    取消按钮.addEventListener('click', () => {
      关闭对话框(null)
    })
    确定按钮.addEventListener('click', () => {
      关闭对话框(输入框.value)
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
        关闭对话框(输入框.value)
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
      输入框.focus()
      if (默认值 !== void 0) {
        输入框.select()
      }
    }, 0)
  })
}
