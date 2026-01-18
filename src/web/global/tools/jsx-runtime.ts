import { 增强样式类型 } from '../types/style'
import { 创建元素 } from './create-element'

export type JSX属性基础类型 = { style?: 增强样式类型; children?: JSX子元素 }

export type JSX子元素 = HTMLElement | string | number | boolean | null | undefined | JSX子元素[]

export type JSX有效返回值 = HTMLElement | DocumentFragment

type 组件类型<K extends keyof HTMLElementTagNameMap> =
  | K
  | ((属性: JSX属性基础类型) => JSX有效返回值)
  | (new (属性: any) => JSX有效返回值)

function 是类组件(类型: any): boolean {
  return typeof 类型 === 'function' && 类型.prototype instanceof HTMLElement
}

function 处理组件<K extends keyof HTMLElementTagNameMap>(
  类型: 组件类型<K>,
  属性: JSX属性基础类型 & Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'children'>>,
): JSX有效返回值 {
  if (typeof 类型 === 'string') {
    return 创建元素(类型, 属性 as Parameters<typeof 创建元素<K>>[1])
  }
  if (typeof 类型 === 'function') {
    if (是类组件(类型)) {
      return new (类型 as any)(属性)
    }
    return (类型 as any)(属性)
  }
  return 创建元素(类型 as K, 属性 as Parameters<typeof 创建元素<K>>[1])
}

export function jsx<K extends keyof HTMLElementTagNameMap>(
  类型: 组件类型<K>,
  属性: JSX属性基础类型 & Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'children'>>,
): JSX有效返回值 {
  return 处理组件(类型, 属性)
}

export function jsxs<K extends keyof HTMLElementTagNameMap>(
  类型: 组件类型<K>,
  属性: JSX属性基础类型 & Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'children'>>,
): JSX有效返回值 {
  return 处理组件(类型, 属性)
}

export function Fragment(属性: { children?: JSX子元素 }): DocumentFragment {
  let 片段 = document.createDocumentFragment()
  if (属性.children !== null && 属性.children !== void 0) {
    添加子元素到片段(片段, 属性.children)
  }
  return 片段
}

function 添加子元素到片段(片段: DocumentFragment, 子元素: JSX子元素): void {
  if (子元素 === null || 子元素 === void 0 || typeof 子元素 === 'boolean') {
    return
  }
  if (Array.isArray(子元素)) {
    for (let 当前子元素 of 子元素) {
      添加子元素到片段(片段, 当前子元素)
    }
    return
  }
  if (typeof 子元素 === 'string' || typeof 子元素 === 'number') {
    片段.appendChild(document.createTextNode(String(子元素)))
    return
  }
  if (子元素 instanceof DocumentFragment) {
    片段.appendChild(子元素)
    return
  }
  if (子元素 instanceof HTMLElement) {
    片段.appendChild(子元素)
    return
  }
}
