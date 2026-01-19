import { 注入tailwind } from '../global/tools/tailwind-inject'
import { 组件基类 } from './base'

export abstract class 组件tailwind基类<
  属性类型 extends Record<string, string>,
  发出事件类型 extends Record<string, any>,
  监听事件类型 extends Record<string, any>,
> extends 组件基类<属性类型, 发出事件类型, 监听事件类型> {
  protected abstract 当子类加载时(): Promise<void>

  protected override async 当加载时(): Promise<void> {
    await 注入tailwind(this.shadow)
    await this.当子类加载时()
  }
}
