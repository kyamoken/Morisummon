import eslint from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{ts,tsx}'],
  },
  { languageOptions: { globals: globals.browser } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    rules: {
      // Best practices
      'no-debugger': 'warn',
      'no-fallthrough': 'error',
      'yoda': 'warn',
      'eqeqeq': 'warn',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-leaked-render': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',

      // Coding styles
      // 'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      // 'comma-dangle': ['warn', 'always-multiline'],
      'semi': ['warn', 'always'],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'no-trailing-spaces': 'warn',
    },
    settings: { react: { version: "detect" } },
  },
];
