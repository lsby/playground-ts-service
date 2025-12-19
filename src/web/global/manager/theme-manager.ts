import { API管理器 } from './api-manager'

type 主题类型 = '系统' | '亮色' | '暗色'

export let 主题管理器 = {
  当前主题: '系统' as 主题类型,

  async 初始化(从数据库加载: boolean = true): Promise<void> {
    if (从数据库加载) {
      try {
        let 用户配置 = await API管理器.请求post接口并处理错误('/api/system/get-user-config', {})
        this.当前主题 = 用户配置.theme
        this.应用主题()
      } catch (_e) {
        // 如果获取失败，使用系统主题
        this.当前主题 = '系统'
        this.应用主题()
      }
    } else {
      // 不尝试从数据库加载，直接使用系统主题
      this.当前主题 = '系统'
      this.应用主题()
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').onchange = (): void => {
      if (this.当前主题 === '系统') {
        this.应用主题()
      }
    }
  },

  应用主题(): void {
    if (this.当前主题 === '系统') {
      // 移除 data-theme 属性，让 CSS 使用媒体查询
      document.documentElement.removeAttribute('data-theme')
    } else {
      // 设置 data-theme 属性为具体的主题
      document.documentElement.setAttribute('data-theme', this.当前主题 === '亮色' ? 'light' : 'dark')
    }
  },

  async 设置主题(主题: 主题类型): Promise<void> {
    this.当前主题 = 主题
    this.应用主题()

    // 更新数据库中的用户配置
    try {
      await API管理器.请求post接口并处理错误('/api/system/update-user-config', { theme: 主题 })
    } catch (_e) {
      // 如果更新失败，回滚到之前的主题
      await this.初始化()
    }
  },
}
