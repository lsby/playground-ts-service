declare global {
  namespace JSX {
    interface Element extends HTMLElement {}

    type 元素子节点 = string | number | boolean | null | undefined | HTMLElement | SVGElement | 元素子节点[]

    type HTML元素基础属性<T> = {
      style?: import('./style').增强样式类型
      children?: 元素子节点
      ref?: import('../tools/jsx-runtime').Ref引用<HTMLElement> | ((元素: HTMLElement) => void)
      key?: string | number
    } & Omit<Partial<T>, 'style' | 'children'>

    interface IntrinsicElements {
      div: HTML元素基础属性<HTMLDivElement>
      span: HTML元素基础属性<HTMLSpanElement>
      a: HTML元素基础属性<HTMLAnchorElement>
      button: HTML元素基础属性<HTMLButtonElement>
      input: HTML元素基础属性<HTMLInputElement>
      textarea: HTML元素基础属性<HTMLTextAreaElement>
      select: HTML元素基础属性<HTMLSelectElement>
      option: HTML元素基础属性<HTMLOptionElement>
      label: HTML元素基础属性<HTMLLabelElement>
      form: HTML元素基础属性<HTMLFormElement>
      img: HTML元素基础属性<HTMLImageElement>
      video: HTML元素基础属性<HTMLVideoElement>
      audio: HTML元素基础属性<HTMLAudioElement>
      canvas: HTML元素基础属性<HTMLCanvasElement>
      svg: HTML元素基础属性<SVGSVGElement>
      rect: HTML元素基础属性<SVGRectElement>
      circle: HTML元素基础属性<SVGCircleElement>
      line: HTML元素基础属性<SVGLineElement>
      path: HTML元素基础属性<SVGPathElement>
      text: HTML元素基础属性<SVGTextElement>
      g: HTML元素基础属性<SVGGElement>
      defs: HTML元素基础属性<SVGDefsElement>
      clipPath: HTML元素基础属性<SVGClipPathElement>
      polygon: HTML元素基础属性<SVGPolygonElement>
      polyline: HTML元素基础属性<SVGPolylineElement>
      ellipse: HTML元素基础属性<SVGEllipseElement>
      table: HTML元素基础属性<HTMLTableElement>
      thead: HTML元素基础属性<HTMLTableSectionElement>
      tbody: HTML元素基础属性<HTMLTableSectionElement>
      tr: HTML元素基础属性<HTMLTableRowElement>
      td: HTML元素基础属性<HTMLTableCellElement>
      th: HTML元素基础属性<HTMLTableCellElement>
      ul: HTML元素基础属性<HTMLUListElement>
      ol: HTML元素基础属性<HTMLOListElement>
      li: HTML元素基础属性<HTMLLIElement>
      h1: HTML元素基础属性<HTMLHeadingElement>
      h2: HTML元素基础属性<HTMLHeadingElement>
      h3: HTML元素基础属性<HTMLHeadingElement>
      h4: HTML元素基础属性<HTMLHeadingElement>
      h5: HTML元素基础属性<HTMLHeadingElement>
      h6: HTML元素基础属性<HTMLHeadingElement>
      p: HTML元素基础属性<HTMLParagraphElement>
      pre: HTML元素基础属性<HTMLPreElement>
      code: HTML元素基础属性<HTMLElement>
      blockquote: HTML元素基础属性<HTMLQuoteElement>
      hr: HTML元素基础属性<HTMLHRElement>
      br: HTML元素基础属性<HTMLBRElement>
      iframe: HTML元素基础属性<HTMLIFrameElement>
      script: HTML元素基础属性<HTMLScriptElement>
      style: HTML元素基础属性<HTMLStyleElement>
      link: HTML元素基础属性<HTMLLinkElement>
      meta: HTML元素基础属性<HTMLMetaElement>
      title: HTML元素基础属性<HTMLTitleElement>
      head: HTML元素基础属性<HTMLHeadElement>
      body: HTML元素基础属性<HTMLBodyElement>
      section: HTML元素基础属性<HTMLElement>
      article: HTML元素基础属性<HTMLElement>
      header: HTML元素基础属性<HTMLElement>
      footer: HTML元素基础属性<HTMLElement>
      nav: HTML元素基础属性<HTMLElement>
      aside: HTML元素基础属性<HTMLElement>
      main: HTML元素基础属性<HTMLElement>
    }

    interface ElementChildrenAttribute {
      children: {}
    }
  }
}

export {}
