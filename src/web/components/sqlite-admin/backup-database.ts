import { 联合转元组 } from '../../../tools/tools'
import { 组件基类 } from '../../base/base'
import { API管理器 } from '../../global/api-manager'
import { 创建元素 } from '../../global/create-element'
import { 显示模态框 } from '../../global/modal'
import { LsbySplitLog } from '../general/split-log'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class LsbyBackupDatabase extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: 联合转元组<keyof 属性类型> = []
  static {
    this.注册组件('lsby-backup-database', this)
  }

  public constructor(属性: 属性类型) {
    super(属性)
  }

  protected override async 当加载时(): Promise<void> {
    let style = this.获得宿主样式()
    style.display = 'flex'
    style.flexDirection = 'column'
    style.padding = '20px'
    style.gap = '10px'
    style.width = '100%'

    let 标题 = 创建元素('h2', {
      textContent: '备份数据库',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
      },
    })

    let 备份按钮 = 创建元素('button', {
      textContent: '开始备份',
      style: {
        padding: '8px 16px',
        fontSize: '16px',
        backgroundColor: 'var(--主要按钮颜色)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    })
    备份按钮.onclick = async (): Promise<void> => {
      let splitLog = new LsbySplitLog()

      let 左侧内容 = 创建元素('div', {
        style: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },
      })

      let 开始备份按钮 = 创建元素('button', {
        textContent: '开始备份',
        style: { marginBottom: '10px' },
      })

      左侧内容.appendChild(开始备份按钮)
      左侧内容.setAttribute('slot', 'left')
      splitLog.appendChild(左侧内容)

      开始备份按钮.addEventListener('click', async () => {
        开始备份按钮.disabled = true
        splitLog.日志组件.添加日志('开始备份数据库...')
        try {
          await API管理器.请求post接口并处理错误(
            '/api/sqlite-admin/backup-database',
            {},
            async (data: { message: string }) => {
              splitLog.日志组件.添加日志(data.message)
            },
          )
          splitLog.日志组件.添加日志('备份成功')
        } catch (错误) {
          console.error('备份数据库失败:', 错误)
          splitLog.日志组件.添加日志(`备份失败: ${错误}`)
        } finally {
          开始备份按钮.disabled = false
        }
      })

      await 显示模态框({ 标题: '备份数据库' }, splitLog)
    }

    this.shadow.appendChild(标题)
    this.shadow.appendChild(备份按钮)
  }
}
