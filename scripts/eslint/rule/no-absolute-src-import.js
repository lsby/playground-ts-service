import path from 'path'

export default {
  meta: {
    type: 'problem',
    docs: { description: '禁止从 src/ 开始的绝对路径引入，应当使用相对路径' },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      'ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration'(node) {
        if (node.source !== null && node.source.type === 'Literal' && typeof node.source.value === 'string') {
          let 模块路径 = node.source.value
          if (模块路径.startsWith('src/')) {
            context.report({
              node: node.source,
              message: '请使用相对路径代替以 src/ 开头的绝对路径',
              fix(fixer) {
                let 文件路径 = context.getFilename()
                let 文件目录 = path.dirname(文件路径)
                let 项目根目录 = context.getCwd()
                let 源码根目录 = path.resolve(项目根目录, 'src')

                let 相对源码根路径 = path.relative(文件目录, 源码根目录)
                let 路径前缀 = 相对源码根路径 === '' ? './' : 相对源码根路径.replace(/\\/g, '/') + '/'

                let 新路径 = 模块路径.replace('src/', 路径前缀)
                return fixer.replaceText(node.source, `'${新路径}'`)
              },
            })
          }
        }
      },
    }
  },
}
