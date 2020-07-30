module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true
    }
  },
  env: {
    mocha: true
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
