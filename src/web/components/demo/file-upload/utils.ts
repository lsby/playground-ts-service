import { 创建元素 } from '../../../global/tools/create-element'

export function 格式化文件大小(字节数: number): string {
  if (字节数 < 1024) {
    return `${字节数} B`
  }
  if (字节数 < 1024 * 1024) {
    return `${(字节数 / 1024).toFixed(1)} KB`
  }
  return `${(字节数 / (1024 * 1024)).toFixed(1)} MB`
}

export function 创建Svg节点(svg字符串: string): HTMLDivElement {
  let 容器 = 创建元素('div', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } })
  容器.innerHTML = svg字符串
  return 容器
}

export let 图标_徽章 = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--主色调)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
export let 图标_云上传 = `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--主色调)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>`
export let 图标_文件 = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--主色调)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
export let 图标_删除 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
export let 图标_成功 = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--成功颜色)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
export let 图标_失败 = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--错误颜色)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
