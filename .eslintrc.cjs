module.exports = {
  extends: ['@lsby/eslint-config', 'plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/jsx-pascal-case': 'off',
  },
}
