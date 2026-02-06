import { 增强样式类型 } from '../types/style'
import { 创建元素 } from './create-element'

export type Ref引用<T> = { current: T | null }

export type JSX属性基础类型 = {
  style?: 增强样式类型
  children?: JSX子元素
  ref?: Ref引用<HTMLElement> | ((元素: HTMLElement) => void)
  key?: string | number
}

export type JSX子元素 = HTMLElement | string | number | boolean | null | undefined | SVGElement | JSX子元素[]

export type JSX有效返回值 = HTMLElement | DocumentFragment

export function 创建引用<T = HTMLElement>(): Ref引用<T> {
  return { current: null }
}

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
  let { ref, key, ...剩余属性 } = 属性

  let 元素: JSX有效返回值
  let 类型类别 = typeof 类型

  switch (类型类别) {
    case 'string':
      元素 = 创建元素(类型 as K, 剩余属性 as Parameters<typeof 创建元素<K>>[1])
      break
    case 'function':
      if (是类组件(类型)) {
        元素 = new (类型 as new (属性: any) => JSX有效返回值)(剩余属性)
      } else {
        元素 = (类型 as (属性: any) => JSX有效返回值)(剩余属性)
      }
      break
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'symbol':
    case 'undefined':
    case 'object':
      元素 = 创建元素(类型 as K, 剩余属性 as Parameters<typeof 创建元素<K>>[1])
      break
  }

  if (元素 instanceof HTMLElement) {
    if (typeof key === 'string' || typeof key === 'number') {
      元素.dataset['key'] = String(key)
    }

    if (ref !== void 0) {
      switch (typeof ref) {
        case 'function':
          ref(元素)
          break
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'symbol':
        case 'undefined':
        case 'object':
          ref.current = 元素
          break
      }
    }
  }

  return 元素
}

export function jsx<K extends keyof HTMLElementTagNameMap>(
  类型: 组件类型<K>,
  属性: JSX属性基础类型 & Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'children'>>,
  key?: string | number,
): JSX有效返回值 {
  if (key !== void 0) {
    return 处理组件(类型, { ...属性, key })
  }
  return 处理组件(类型, 属性)
}

export function jsxs<K extends keyof HTMLElementTagNameMap>(
  类型: 组件类型<K>,
  属性: JSX属性基础类型 & Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'children'>>,
  key?: string | number,
): JSX有效返回值 {
  if (key !== void 0) {
    return 处理组件(类型, { ...属性, key })
  }
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
