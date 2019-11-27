module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true
    }
  },
  env: {
    browser: true,
    mocha: true
  },
  globals: {
    fetch: true
  },
  extends: ['eslint-config-airbnb-base', 'eslint-config-prettier'],
  rules: {
    'comma-dangle': ['error', 'never'],
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],
    'no-var': ['error'],
    'arrow-parens': [2, 'as-needed'],
    'prefer-arrow-callback': ['error']
  }
};
