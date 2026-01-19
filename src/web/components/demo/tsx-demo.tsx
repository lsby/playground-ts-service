import { 组件基类 } from '../../base/base'
import { globalWebLog } from '../../global/manager/log-manager'
import { 创建引用 } from '../../global/tools/jsx-runtime'
import { 普通按钮 } from '../general/base/base-button'

export class TSX演示组件 extends 组件基类<{}, {}, {}> {
  protected static override 观察的属性 = ['标题']
  static {
    this.注册组件('tsx-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    this.style.display = 'block'
    this.style.height = '100%'
    this.style.overflow = 'hidden'

    let 输入框引用 = 创建引用<HTMLInputElement>()
    let 文本框引用 = 创建引用<HTMLDivElement>()

    let 容器 = (
      <div
        style={{
          padding: '20px',
          color: 'var(--文字颜色)',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <h2>TSX / JSX 功能演示</h2>
        <p style={{ fontSize: '14px', color: 'var(--次要文字颜色)', marginBottom: '20px' }}>
          演示 TSX 语法以及 ref、key 等特性
        </p>

        <div
          style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--次要背景颜色)', borderRadius: '8px' }}
        >
          <h3>基础语法</h3>
          <p style={{ fontSize: '13px', color: 'var(--次要文字颜色)', marginBottom: '10px' }}>
            使用 JSX/TSX 语法创建元素和组件
          </p>
          <普通按钮 文本="点击测试" 点击处理函数={() => alert('TSX 按钮点击成功！')} />
        </div>

        <div
          style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--次要背景颜色)', borderRadius: '8px' }}
        >
          <h3>列表渲染与 Key</h3>
          <p style={{ fontSize: '13px', color: 'var(--次要文字颜色)', marginBottom: '10px' }}>
            使用 map 渲染列表，key 属性用于标识元素
          </p>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {['项目A', '项目B', '项目C'].map((名称, 索引) => (
              <li
                key={索引}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  backgroundColor: 'var(--主要背景颜色)',
                  border: '1px solid var(--边框颜色)',
                  borderRadius: '4px',
                }}
              >
                {名称} (key: {索引})
              </li>
            ))}
          </ul>
          <普通按钮
            文本="在控制台打印 data-key"
            点击处理函数={() => {
              let 列表项 = this.shadow.querySelectorAll('li')
              列表项.forEach((项) => {
                void globalWebLog.info('元素:', 项, 'data-key:', 项.dataset['key'])
              })
            }}
          />
        </div>

        <div
          style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--次要背景颜色)', borderRadius: '8px' }}
        >
          <h3>Ref 引用</h3>
          <p style={{ fontSize: '13px', color: 'var(--次要文字颜色)', marginBottom: '10px' }}>
            使用 ref 获取 DOM 元素引用
          </p>
          <input
            ref={输入框引用}
            type="text"
            placeholder="输入文字"
            style={{
              padding: '8px',
              marginRight: '10px',
              width: '200px',
              backgroundColor: 'var(--输入框背景)',
              color: 'var(--文字颜色)',
              border: '1px solid var(--边框颜色)',
            }}
          />
          <普通按钮
            文本="获取输入值"
            点击处理函数={() => {
              if (输入框引用.current !== null) {
                alert(输入框引用.current.value)
              }
            }}
          />
        </div>

        <div style={{ padding: '15px', backgroundColor: 'var(--次要背景颜色)', borderRadius: '8px' }}>
          <h3>操作引用元素</h3>
          <p style={{ fontSize: '13px', color: 'var(--次要文字颜色)', marginBottom: '10px' }}>
            通过 ref.current 直接操作 DOM 元素
          </p>
          <div
            ref={文本框引用}
            style={{
              padding: '15px',
              backgroundColor: 'var(--主要背景颜色)',
              border: '1px solid var(--边框颜色)',
              borderRadius: '5px',
              marginBottom: '10px',
            }}
          >
            点击按钮修改此文本
          </div>
          <普通按钮
            文本="修改文本"
            点击处理函数={() => {
              if (文本框引用.current !== null) {
                文本框引用.current.textContent = `时间: ${new Date().toLocaleTimeString()}`
              }
            }}
          />
        </div>
      </div>
    )

    this.shadow.appendChild(容器)
  }
}
