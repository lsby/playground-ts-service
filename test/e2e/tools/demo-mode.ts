import { Locator, Page } from '@playwright/test'

// 演示模式控制变量
export let 演示模式 = process.env['DEMO_MODE'] === 'true'

export function 设置演示模式(开启: boolean): void {
  演示模式 = 开启
}

export async function 演示_说明(page: Page, message: string): Promise<void> {
  if (!演示模式) return
  await page.evaluate((msg) => {
    let div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '10%'
    div.style.left = '50%'
    div.style.transform = 'translateX(-50%)'
    div.style.padding = '20px 40px'
    div.style.background = 'rgba(0, 0, 0, 0.85)'
    div.style.color = 'white'
    div.style.fontSize = '24px'
    div.style.borderRadius = '12px'
    div.style.zIndex = '999999'
    div.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)'
    div.style.textAlign = 'center'
    div.style.fontWeight = 'bold'
    div.textContent = msg
    document.body.appendChild(div)
    setTimeout(() => div.remove(), 4000)
  }, message)
  await page.waitForTimeout(4000)
}

export async function 演示_动画(locator: Locator, color: string): Promise<void> {
  if (!演示模式) return
  await locator.evaluate((node: HTMLElement, col) => {
    let rect = node.getBoundingClientRect()
    let div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.left = rect.left + 'px'
    div.style.top = rect.top + 'px'
    div.style.width = rect.width + 'px'
    div.style.height = rect.height + 'px'
    div.style.border = `4px solid ${col}`
    div.style.boxShadow = `0 0 15px ${col}`
    div.style.borderRadius = '4px'
    div.style.zIndex = '999998'
    div.style.pointerEvents = 'none'
    div.style.transition = 'all 0.3s'
    document.body.appendChild(div)

    let cursor = document.createElement('div')
    cursor.style.position = 'fixed'
    cursor.style.left = rect.left + rect.width / 2 + 'px'
    cursor.style.top = rect.top + rect.height / 2 + 'px'
    cursor.style.width = '30px'
    cursor.style.height = '30px'
    cursor.style.borderRadius = '50%'
    cursor.style.background = col.replace(')', ', 0.4)').replace('rgb', 'rgba')
    cursor.style.zIndex = '999999'
    cursor.style.pointerEvents = 'none'
    cursor.style.transform = 'translate(-50%, -50%) scale(2)'
    cursor.style.transition = 'transform 0.3s ease-out'
    document.body.appendChild(cursor)

    requestAnimationFrame(() => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)'
    })

    setTimeout(() => {
      div.remove()
      cursor.remove()
    }, 800)
  }, color)
  await locator.page().waitForTimeout(800)
}

export async function 演示_点击(locator: Locator): Promise<void> {
  await 演示_动画(locator, 'rgb(255, 0, 0)')
  await locator.click()
}

export async function 演示_输入(locator: Locator, text: string): Promise<void> {
  await 演示_动画(locator, 'rgb(0, 85, 255)')
  await locator.fill(text)
  if (演示模式) await locator.page().waitForTimeout(400)
}

export async function 演示_勾选(locator: Locator): Promise<void> {
  await 演示_动画(locator, 'rgb(255, 165, 0)')
  await locator.check()
}

export async function 演示_选择(locator: Locator, option: { label: string }): Promise<void> {
  await 演示_动画(locator, 'rgb(0, 200, 0)')
  await locator.selectOption(option)
  if (演示模式) await locator.page().waitForTimeout(400)
}
