import { 组件基类 } from '../../base/base'
import { 信息提示, 成功提示, 警告提示, 错误提示 } from '../../global/manager/toast-manager'
import { 创建元素 } from '../../global/tools/create-element'
import { 主要按钮, 危险按钮, 成功按钮, 普通按钮, 警告按钮 } from '../general/base/base-button'

type 属性类型 = {}
type 发出事件类型 = {}
type 监听事件类型 = {}

export class 演示吐司消息组件 extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected static override 观察的属性: Array<keyof 属性类型> = []

  static {
    this.注册组件('lsby-toast-demo', this)
  }

  protected override async 当加载时(): Promise<void> {
    let 容器 = 创建元素('div', {
      style: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
      },
    })

    let 标题 = 创建元素('h2', {
      textContent: '吐司消息演示',
      style: {
        marginBottom: '10px',
      },
    })

    let 成功按钮实例 = new 成功按钮({
      文本: '显示成功消息',
      点击处理函数: async (): Promise<void> => {
        成功提示('操作成功完成!')
      },
    })

    let 错误按钮实例 = new 危险按钮({
      文本: '显示错误消息',
      点击处理函数: async (): Promise<void> => {
        错误提示('发生了一个错误!')
      },
    })

    let 警告按钮实例 = new 警告按钮({
      文本: '显示警告消息',
      点击处理函数: async (): Promise<void> => {
        警告提示('这是一个警告提示!')
      },
    })

    let 信息按钮实例 = new 普通按钮({
      文本: '显示信息消息',
      点击处理函数: async (): Promise<void> => {
        信息提示('这是一条普通信息')
      },
    })

    let 长文本按钮实例 = new 普通按钮({
      文本: '显示长文本消息',
      点击处理函数: async (): Promise<void> => {
        信息提示('这是一条很长很长的消息,用来测试吐司组件在处理长文本时的表现是否正常,看看会不会换行或者溢出。')
      },
    })

    let 自定义时长按钮实例 = new 主要按钮({
      文本: '显示自定义时长消息(5秒)',
      点击处理函数: async (): Promise<void> => {
        成功提示('这条消息会显示5秒钟', 5000)
      },
    })

    let 多个吐司按钮实例 = new 主要按钮({
      文本: '连续显示多个吐司',
      点击处理函数: async (): Promise<void> => {
        成功提示('第一条消息')
        警告提示('第二条消息')
        错误提示('第三条消息')
        信息提示('第四条消息')
      },
    })

    容器.appendChild(标题)
    容器.appendChild(成功按钮实例)
    容器.appendChild(错误按钮实例)
    容器.appendChild(警告按钮实例)
    容器.appendChild(信息按钮实例)
    容器.appendChild(长文本按钮实例)
    容器.appendChild(自定义时长按钮实例)
    容器.appendChild(多个吐司按钮实例)

    this.shadow.appendChild(容器)
  }
}
