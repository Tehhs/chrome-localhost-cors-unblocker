module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:jsdoc/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  rules: {
    'no-const-assign' : 'warn', //Dumb reassigning const errors that I always run into 
    'jsdoc/check-types': 'warn',  // Add type checking for JSDoc
    'jsdoc/require-param-type': 'warn',  // Enforce param types
    'jsdoc/require-returns-type': 'warn',  // Enforce return types
    'no-unused-vars': 'warn',
    'no-debugger': 'warn'
  },
}
