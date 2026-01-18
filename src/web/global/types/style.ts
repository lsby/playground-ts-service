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
    | 'contents'
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
