module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
};
