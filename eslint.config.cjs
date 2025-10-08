const { parserOptions } = require('./.eslintrc.cjs');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: parserOptions || {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn'
    }
  }
];
