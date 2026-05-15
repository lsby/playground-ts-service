import noAbsoluteSrcImport from './rule/no-absolute-src-import.js'
import noDomQuery from './rule/no-dom-query.js'

export default {
  rules: {
    // ...
    'no-dom-query': noDomQuery,
    'no-absolute-src-import': noAbsoluteSrcImport,
  },
}
