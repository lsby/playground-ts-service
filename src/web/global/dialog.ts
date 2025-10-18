export function 显示对话框(消息: string): Promise<void> {
  return new Promise((resolve) => {
    let 遮罩层 = document.createElement('div')
    遮罩层.style.position = 'fixed'
    遮罩层.style.top = '0'
    遮罩层.style.left = '0'
    遮罩层.style.width = '100%'
    遮罩层.style.height = '100%'
    遮罩层.style.backgroundColor = 'var(--遮罩颜色)'
    遮罩层.style.display = 'flex'
    遮罩层.style.justifyContent = 'center'
    遮罩层.style.alignItems = 'center'
    遮罩层.style.zIndex = '10000'

    let 对话框 = document.createElement('div')
    对话框.style.backgroundColor = 'var(--卡片背景颜色)'
    对话框.style.padding = '20px'
    对话框.style.borderRadius = '8px'
    对话框.style.boxShadow = '0 4px 12px var(--深阴影颜色)'
    对话框.style.minWidth = '300px'
    对话框.style.maxWidth = '500px'
    对话框.style.display = 'flex'
    对话框.style.flexDirection = 'column'
    对话框.style.gap = '16px'
    对话框.style.border = '1px solid var(--边框颜色)'

    let 消息元素 = document.createElement('div')
    消息元素.textContent = 消息
    消息元素.style.fontSize = '14px'
    消息元素.style.lineHeight = '1.5'
    消息元素.style.color = 'var(--文字颜色)'
    消息元素.style.whiteSpace = 'pre-wrap'

    let 按钮容器 = document.createElement('div')
    按钮容器.style.display = 'flex'
    按钮容器.style.justifyContent = 'flex-end'

    let 确定按钮 = document.createElement('button')
    确定按钮.textContent = '确定'
    确定按钮.style.padding = '8px 24px'
    确定按钮.style.backgroundColor = 'var(--主色调)'
    确定按钮.style.color = 'var(--卡片背景颜色)'
    确定按钮.style.border = 'none'
    确定按钮.style.borderRadius = '4px'
    确定按钮.style.cursor = 'pointer'
    确定按钮.style.fontSize = '14px'

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
    let 遮罩层 = document.createElement('div')
    遮罩层.style.position = 'fixed'
    遮罩层.style.top = '0'
    遮罩层.style.left = '0'
    遮罩层.style.width = '100%'
    遮罩层.style.height = '100%'
    遮罩层.style.backgroundColor = 'var(--遮罩颜色)'
    遮罩层.style.display = 'flex'
    遮罩层.style.justifyContent = 'center'
    遮罩层.style.alignItems = 'center'
    遮罩层.style.zIndex = '10000'

    let 对话框 = document.createElement('div')
    对话框.style.backgroundColor = 'var(--卡片背景颜色)'
    对话框.style.padding = '20px'
    对话框.style.borderRadius = '8px'
    对话框.style.boxShadow = '0 4px 12px var(--深阴影颜色)'
    对话框.style.minWidth = '300px'
    对话框.style.maxWidth = '500px'
    对话框.style.display = 'flex'
    对话框.style.flexDirection = 'column'
    对话框.style.gap = '16px'
    对话框.style.border = '1px solid var(--边框颜色)'

    let 消息元素 = document.createElement('div')
    消息元素.textContent = 消息
    消息元素.style.fontSize = '14px'
    消息元素.style.lineHeight = '1.5'
    消息元素.style.color = 'var(--文字颜色)'
    消息元素.style.whiteSpace = 'pre-wrap'

    let 按钮容器 = document.createElement('div')
    按钮容器.style.display = 'flex'
    按钮容器.style.justifyContent = 'flex-end'
    按钮容器.style.gap = '8px'

    let 取消按钮 = document.createElement('button')
    取消按钮.textContent = '取消'
    取消按钮.style.padding = '8px 24px'
    取消按钮.style.backgroundColor = 'var(--按钮背景)'
    取消按钮.style.color = 'var(--按钮文字)'
    取消按钮.style.border = '1px solid var(--边框颜色)'
    取消按钮.style.borderRadius = '4px'
    取消按钮.style.cursor = 'pointer'
    取消按钮.style.fontSize = '14px'

    let 确定按钮 = document.createElement('button')
    确定按钮.textContent = '确定'
    确定按钮.style.padding = '8px 24px'
    确定按钮.style.backgroundColor = 'var(--主色调)'
    确定按钮.style.color = 'var(--卡片背景颜色)'
    确定按钮.style.border = 'none'
    确定按钮.style.borderRadius = '4px'
    确定按钮.style.cursor = 'pointer'
    确定按钮.style.fontSize = '14px'

    取消按钮.addEventListener('mouseenter', () => {
      取消按钮.style.backgroundColor = 'var(--悬浮背景颜色)'
    })
    取消按钮.addEventListener('mouseleave', () => {
      取消按钮.style.backgroundColor = 'var(--按钮背景)'
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
