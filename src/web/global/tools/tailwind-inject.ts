import 样式文本 from 'bundle-text:../style/tailwind.css'

let 全局样式表: CSSStyleSheet | null = null

async function 获取全局样式表(): Promise<CSSStyleSheet> {
  if (全局样式表 !== null) return 全局样式表
  全局样式表 = new CSSStyleSheet()
  await 全局样式表.replace(样式文本)
  return 全局样式表
}

export async function 注入tailwind(shadow: ShadowRoot): Promise<void> {
  let tailwind样式表 = await 获取全局样式表()
  let 已有样式表 = Array.from(shadow.adoptedStyleSheets)
  shadow.adoptedStyleSheets = [tailwind样式表, ...已有样式表]
}
