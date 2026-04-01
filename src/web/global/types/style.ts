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
  | 'userSelect'
  | 'WebkitLineClamp'
  | 'WebkitBoxOrient'
  | 'gap'
  | 'rowGap'
  | 'columnGap'
  | 'flexGrow'
  | 'flexShrink'
  | 'order'
  | 'zIndex'
> & {
  // Flex 相关
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  gap?: string | number
  rowGap?: string | number
  columnGap?: string | number
  flexGrow?: number | string
  flexShrink?: number | string
  order?: number | string
} & {
  // Z-Index
  zIndex?: number | string
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
    | '-webkit-box'
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
  WebkitLineClamp?: number | string
  WebkitBoxOrient?: 'vertical' | 'horizontal'
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
    | 'col-resize'
} & {
  // Pointer Events
  pointerEvents?: 'auto' | 'none'
  userSelect?: 'none' | 'auto' | 'text' | 'all' | 'contain' | 'element'
} & {
  // Size
  maxWidth?: string | undefined
  minWidth?: string | undefined
  maxHeight?: string | undefined
  minHeight?: string | undefined
}
