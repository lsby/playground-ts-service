type 吐司类型 = 'success' | 'error' | 'warning' | 'info'

interface 吐司选项 {
  类型?: 吐司类型
  持续时间?: number
  位置?: 'top' | 'bottom' | 'center'
}

let 吐司容器: HTMLDivElement | null = null

function 获取或创建吐司容器(位置: 'top' | 'bottom' | 'center'): HTMLDivElement {
  if (吐司容器 === null || 吐司容器.parentElement === null) {
    吐司容器 = document.createElement('div')
    吐司容器.style.position = 'fixed'
    吐司容器.style.left = '50%'
    吐司容器.style.transform = 'translateX(-50%)'
    吐司容器.style.zIndex = '10001'
    吐司容器.style.display = 'flex'
    吐司容器.style.flexDirection = 'column'
    吐司容器.style.gap = '8px'
    吐司容器.style.pointerEvents = 'none'
    吐司容器.style.maxWidth = '90%'
    吐司容器.style.width = 'fit-content'
    document.body.appendChild(吐司容器)
  }

  // 更新位置
  if (位置 === 'top') {
    吐司容器.style.top = '20px'
    吐司容器.style.bottom = 'auto'
  } else if (位置 === 'bottom') {
    吐司容器.style.bottom = '20px'
    吐司容器.style.top = 'auto'
  } else {
    吐司容器.style.top = '50%'
    吐司容器.style.bottom = 'auto'
    吐司容器.style.transform = 'translate(-50%, -50%)'
  }

  return 吐司容器
}

function 获取吐司样式(类型: 吐司类型): { 背景色变量: string; 图标: string } {
  switch (类型) {
    case 'success':
      return { 背景色变量: 'var(--成功颜色)', 图标: '✓' }
    case 'error':
      return { 背景色变量: 'var(--错误颜色)', 图标: '✕' }
    case 'warning':
      return { 背景色变量: 'var(--警告颜色)', 图标: '⚠' }
    case 'info':
      return { 背景色变量: 'var(--信息颜色)', 图标: 'ℹ' }
  }
}

export function 显示吐司(消息: string, 选项: 吐司选项 = {}): Promise<void> {
  return new Promise((resolve) => {
    let 类型 = 选项.类型 ?? 'info'
    let 持续时间 = 选项.持续时间 ?? 3000
    let 位置 = 选项.位置 ?? 'top'

    let 容器 = 获取或创建吐司容器(位置)
    let 样式 = 获取吐司样式(类型)

    let 吐司元素 = document.createElement('div')
    吐司元素.style.backgroundColor = 样式.背景色变量
    吐司元素.style.color = 'var(--吐司文字颜色)'
    吐司元素.style.padding = '12px 24px'
    吐司元素.style.borderRadius = '4px'
    吐司元素.style.boxShadow = '0 4px 12px var(--吐司阴影)'
    吐司元素.style.display = 'flex'
    吐司元素.style.alignItems = 'center'
    吐司元素.style.gap = '8px'
    吐司元素.style.fontSize = '14px'
    吐司元素.style.lineHeight = '1.5'
    吐司元素.style.pointerEvents = 'auto'
    吐司元素.style.cursor = 'pointer'
    吐司元素.style.minWidth = '200px'
    吐司元素.style.maxWidth = '500px'
    吐司元素.style.opacity = '0'
    吐司元素.style.transform =
      位置 === 'top' ? 'translateY(-20px)' : 位置 === 'bottom' ? 'translateY(20px)' : 'scale(0.9)'
    吐司元素.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    吐司元素.style.wordBreak = 'break-word'

    let 图标元素 = document.createElement('span')
    图标元素.textContent = 样式.图标
    图标元素.style.fontSize = '16px'
    图标元素.style.fontWeight = 'bold'
    图标元素.style.flexShrink = '0'

    let 消息元素 = document.createElement('span')
    消息元素.textContent = 消息
    消息元素.style.flex = '1'

    吐司元素.appendChild(图标元素)
    吐司元素.appendChild(消息元素)
    容器.appendChild(吐司元素)

    // 触发动画
    setTimeout(() => {
      吐司元素.style.opacity = '1'
      吐司元素.style.transform = 位置 === 'center' ? 'scale(1)' : 'translateY(0)'
    }, 10)

    let 移除吐司 = (): void => {
      吐司元素.style.opacity = '0'
      吐司元素.style.transform =
        位置 === 'top' ? 'translateY(-20px)' : 位置 === 'bottom' ? 'translateY(20px)' : 'scale(0.9)'

      setTimeout(() => {
        if (吐司元素.parentElement === 容器) {
          容器.removeChild(吐司元素)
        }
        // 如果容器为空,也移除容器
        if (容器.children.length === 0 && 容器.parentElement === document.body) {
          document.body.removeChild(容器)
          吐司容器 = null
        }
        resolve()
      }, 300)
    }

    // 点击关闭
    吐司元素.addEventListener('click', 移除吐司)

    // 自动关闭
    if (持续时间 > 0) {
      setTimeout(移除吐司, 持续时间)
    }
  })
}

// 便捷方法
export function 成功提示(消息: string, 持续时间?: number): Promise<void> {
  let 选项: 吐司选项 = { 类型: 'success' }
  if (持续时间 !== void 0) {
    选项.持续时间 = 持续时间
  }
  return 显示吐司(消息, 选项)
}

export function 错误提示(消息: string, 持续时间?: number): Promise<void> {
  let 选项: 吐司选项 = { 类型: 'error' }
  if (持续时间 !== void 0) {
    选项.持续时间 = 持续时间
  }
  return 显示吐司(消息, 选项)
}

export function 警告提示(消息: string, 持续时间?: number): Promise<void> {
  let 选项: 吐司选项 = { 类型: 'warning' }
  if (持续时间 !== void 0) {
    选项.持续时间 = 持续时间
  }
  return 显示吐司(消息, 选项)
}

export function 信息提示(消息: string, 持续时间?: number): Promise<void> {
  let 选项: 吐司选项 = { 类型: 'info' }
  if (持续时间 !== void 0) {
    选项.持续时间 = 持续时间
  }
  return 显示吐司(消息, 选项)
}
