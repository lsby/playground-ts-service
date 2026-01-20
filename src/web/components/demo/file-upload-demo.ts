import { 组件基类 } from '../../base/base'
import { API管理器类 } from '../../global/class/api'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class FileUploadDemo extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  static {
    this.注册组件('lsby-file-upload-demo', this)
  }

  private 文件输入: HTMLInputElement = document.createElement('input')
  private 描述输入: HTMLInputElement = document.createElement('input')
  private 上传按钮: HTMLButtonElement = document.createElement('button')
  private 结果显示: HTMLDivElement = document.createElement('div')

  protected override async 当加载时(): Promise<void> {
    this.文件输入.type = 'file'
    this.文件输入.multiple = true
    this.文件输入.style.marginBottom = '10px'

    this.描述输入.type = 'text'
    this.描述输入.placeholder = '可选描述'
    this.描述输入.style.marginBottom = '10px'
    this.描述输入.style.width = '100%'

    this.上传按钮.textContent = '上传文件'
    this.上传按钮.style.marginBottom = '10px'
    this.上传按钮.onclick = this.上传文件.bind(this)

    this.shadow.appendChild(this.文件输入)
    this.shadow.appendChild(this.描述输入)
    this.shadow.appendChild(this.上传按钮)
    this.shadow.appendChild(this.结果显示)
  }

  private async 上传文件(): Promise<void> {
    if (this.文件输入.files === null || this.文件输入.files.length === 0) {
      this.结果显示.textContent = '请选择文件'
      return
    }

    let formData = new FormData()
    for (let file of this.文件输入.files) {
      formData.append('files', file)
    }
    if (this.描述输入.value.trim() !== '') {
      formData.append('description', this.描述输入.value.trim())
    }

    try {
      let api = new API管理器类()
      let 结果 = await api.请求form并处理错误('/api/demo/file/upload-file', formData)
      this.结果显示.textContent = `上传成功: ${结果.message}\n文件列表:\n${结果.files.map((f) => `${f.name} (${f.size} bytes)`).join('\n')}`
    } catch (错误) {
      this.结果显示.textContent = `上传失败: ${String(错误)}`
    }
  }
}
