import { 组件基类 } from '../../base/base'
import { 成功提示, 错误提示 } from '../../global/manager/toast-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 主要按钮 } from '../general/base/base-button'

type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示接口类型组件 extends 组件基类<发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-get-interface-type-demo', this)
  }

  private 内容容器 = 创建元素('pre', {
    style: {
      width: '100%',
      maxHeight: '550px',
      overflow: 'auto',
      backgroundColor: 'var(--次要背景颜色)',
      color: 'var(--文本颜色)',
      padding: '16px 20px',
      borderRadius: '8px',
      border: '1px solid var(--边框颜色)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      fontFamily: "'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      fontSize: '13px',
      lineHeight: '1.6',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box',
    },
  })

  private 状态标签 = 创建元素('span', { style: { marginLeft: '10px', fontWeight: 'bold' } })

  protected override async 当加载时(): Promise<void> {
    let 样式 = 创建元素('style', {
      textContent: `
        @keyframes 渐入动效 {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :host {
          display: block;
          animation: 渐入动效 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        pre {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        pre:hover {
          border-color: var(--主色调) !important;
          box-shadow: 0 0 0 3px var(--强调背景颜色);
        }
      `,
    })
    this.shadow.appendChild(样式)

    let 容器 = 创建元素('div', {
      style: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box',
      },
    })

    let 标题 = 创建元素('h2', {
      textContent: '系统接口类型获取演示',
      style: { marginBottom: '10px', color: 'var(--文本颜色)' },
    })

    let 描述 = 创建元素('p', {
      textContent: '该组件通过调用 GET 接口 /api/system/get-interface-type 获取系统自动生成的接口类型。',
      style: { color: 'var(--次要文字颜色)', fontSize: '14px' },
    })

    let 控制栏 = 创建元素('div', {
      style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' },
    })

    let 获取按钮 = new 主要按钮({
      文本: '获取接口类型',
      点击处理函数: async (): Promise<void> => {
        await this.获取数据()
      },
    })

    控制栏.appendChild(获取按钮)
    控制栏.appendChild(this.状态标签)

    容器.appendChild(标题)
    容器.appendChild(描述)
    容器.appendChild(控制栏)
    容器.appendChild(this.内容容器)

    this.shadow.appendChild(容器)
    this.内容容器.textContent = '暂无数据，请点击按钮获取。'
  }

  private async 获取数据(): Promise<void> {
    this.状态标签.textContent = '正在获取...'
    this.状态标签.style.color = 'var(--文本颜色)'
    this.内容容器.textContent = '正在加载，请稍候...'

    try {
      let 响应 = await fetch('/api/system/get-interface-type')
      if (响应.ok === true) {
        let 文本 = await 响应.text()
        this.内容容器.textContent = 文本
        this.状态标签.textContent = '获取成功'
        this.状态标签.style.color = 'var(--成功颜色)'
        成功提示('接口类型获取成功！')
      } else {
        let 错误文本 = await 响应.text()
        this.内容容器.textContent = `请求失败：\n状态码：${响应.status.toString()}\n响应内容：${错误文本}`
        this.状态标签.textContent = '获取失败'
        this.状态标签.style.color = 'var(--错误颜色)'
        错误提示(`获取接口类型失败：${响应.status.toString()}`)
      }
    } catch (错误) {
      this.内容容器.textContent = `发生异常：\n${String(错误)}`
      this.状态标签.textContent = '发生异常'
      this.状态标签.style.color = 'var(--错误颜色)'
      错误提示('请求接口类型发生异常！')
    }
  }
}
