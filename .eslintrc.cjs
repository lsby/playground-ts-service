module.exports = {
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    // 主配置
    '@lsby/eslint-config',
    // hook规则
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react'],
  rules: {
    // 迭代元素必须有key
    'react/jsx-key': 'error',
    // 不可以出现重复的属性
    'react/jsx-no-duplicate-props': 'error',
    // 不可以用数组的索引做key, 因为react是依据位置决定是否重新渲染的
    'react/no-array-index-key': 'error',
    // 不可以在jsx中出现没有转换的html实体
    'react/no-unescaped-entities': 'error',
    // 不可以使用非预定的属性
    'react/no-unknown-property': 'error',
    // 不应该多传props
    'react/prefer-exact-props': 'error',
  },
}
