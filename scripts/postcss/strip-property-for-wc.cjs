const postcss = require('postcss')

const plugin = () => {
  return {
    postcssPlugin: 'strip-property-for-wc',
    Once(root) {
      root.walkAtRules('property', (atRule) => {
        let name = atRule.params.trim()
        let initial = null

        atRule.walkDecls('initial-value', (decl) => {
          initial = decl.value
        })

        if (initial != null) {
          root.prepend(postcss.rule({ selector: ':host', nodes: [postcss.decl({ prop: name, value: initial })] }))
        }

        atRule.remove()
      })
    },
  }
}

plugin.postcss = true

module.exports = plugin
