export function 获得滚动条样式(选择器: string = ':host'): string {
  return `
    ${选择器}::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ${选择器}::-webkit-scrollbar-track {
      background: transparent;
    }
    ${选择器}::-webkit-scrollbar-thumb {
      background: var(--边框颜色);
      border-radius: 3px;
    }
    ${选择器}::-webkit-scrollbar-thumb:hover {
      background: var(--次要文字颜色);
    }
  `
}
