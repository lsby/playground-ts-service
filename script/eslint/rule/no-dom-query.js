export default {
  meta: { type: 'problem', docs: { description: '禁止使用DOM查询方法' }, schema: [] },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'document' &&
          node.callee.property.type === 'Identifier' &&
          [
            'querySelector',
            'querySelectorAll',
            'getElementById',
            'getElementsByClassName',
            'getElementsByTagName',
          ].includes(node.callee.property.name)
        ) {
          context.report({ node, message: '禁止使用DOM查询方法，请使用对象引用' })
        }
      },
    }
  },
}
