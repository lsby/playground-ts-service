export type 增强样式类型 = Omit<
  Partial<CSSStyleDeclaration>,
  | 'flexDirection'
  | 'flexWrap'
  | 'justifyContent'
  | 'alignItems'
  | 'alignContent'
  | 'display'
  | 'position'
  | 'overflow'
  | 'overflowX'
  | 'overflowY'
  | 'visibility'
  | 'textAlign'
  | 'whiteSpace'
  | 'wordBreak'
  | 'cursor'
  | 'pointerEvents'
  | 'maxWidth'
  | 'minWidth'
  | 'maxHeight'
  | 'minHeight'
> & {
  // Flex 相关
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
} & {
  // Display
  display?:
    | 'none'
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'table'
    | 'table-row'
    | 'table-cell'
} & {
  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
} & {
  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto'
} & {
  // Visibility
  visibility?: 'visible' | 'hidden' | 'collapse'
} & {
  // Text
  textAlign?: 'left' | 'right' | 'center' | 'justify'
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line'
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word'
} & {
  // Cursor
  cursor?:
    | 'auto'
    | 'default'
    | 'pointer'
    | 'wait'
    | 'text'
    | 'move'
    | 'not-allowed'
    | 'help'
    | 'grab'
    | 'grabbing'
    | 'zoom-in'
    | 'zoom-out'
} & {
  // Pointer Events
  pointerEvents?: 'auto' | 'none'
} & {
  // Size
  maxWidth?: string | undefined
  minWidth?: string | undefined
  maxHeight?: string | undefined
  minHeight?: string | undefined
}

type 元素属性 = {
  style?: 增强样式类型
}

function 是否为普通对象(值: any): boolean {
  if (值 === null || 值 === void 0) {
    return false
  }
  if (typeof 值 !== 'object') {
    return false
  }
  // 只有纯对象才返回 true
  return Object.getPrototypeOf(值) === Object.prototype
}
function 智能赋值(目标: any, 键: string, 值: any): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let 原始值 = 目标[键]

  // 如果原始值是对象,并且新值也是普通对象,则递归拷贝
  if (typeof 原始值 === 'object' && 原始值 !== null && 是否为普通对象(值)) {
    for (let [子键, 子值] of Object.entries(值)) {
      if (子值 === void 0) continue
      智能赋值(原始值, 子键, 子值)
    }
  } else {
    // 否则直接赋值
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    目标[键] = 值
  }
}
function 添加子元素(父元素: HTMLElement, 子元素: any): void {
  if (Array.isArray(子元素)) {
    for (let 子 of 子元素) {
      添加子元素(父元素, 子)
    }
  } else if (typeof 子元素 === 'string' || typeof 子元素 === 'number') {
    父元素.appendChild(document.createTextNode(String(子元素)))
  } else if (子元素 instanceof HTMLElement) {
    父元素.appendChild(子元素)
  }
}

export function 创建元素<K extends keyof HTMLElementTagNameMap>(
  标签: K,
  属性?: 元素属性 & Omit<Partial<HTMLElementTagNameMap[K]>, 'style'>,
): HTMLElementTagNameMap[K] {
  let 元素 = document.createElement(标签)

  if (属性 === void 0) return 元素

  let { children, ...其他属性 } = 属性

  // 处理所有属性
  for (let [键, 值] of Object.entries(其他属性)) {
    if (值 === void 0) continue
    智能赋值(元素, 键, 值)
  }

  // 处理 children
  if (children !== void 0) {
    添加子元素(元素, children)
  }

  return 元素
}
