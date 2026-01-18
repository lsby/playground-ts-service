import { 组件基类 } from '../../base/base'
import { 普通按钮 } from '../general/base/base-button'

export class TSX演示组件 extends 组件基类<{}, {}, {}> {
  protected static override 观察的属性 = ['标题']
  static {
    this.注册组件('tsx-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 标题 = 'TSX 示例'

    let 项目列表 = ['项目 1', '项目 2', '项目 3']

    let 容器 = (
      <div style={{ padding: '20px' }}>
        <h2>{标题}</h2>
        <p>这是使用 TSX 语法创建的组件</p>

        <div style={{ marginTop: '20px' }}>
          <普通按钮 文本="点击我" 点击处理函数={() => alert('按钮被点击了！')} />
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>列表示例</h3>
          <ul>
            {项目列表.map((项目) => (
              <li>{项目}</li>
            ))}
          </ul>
        </div>
      </div>
    )

    this.shadow.appendChild(容器)
  }
}
