import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['eslint.config.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always']
    }
  },
  {
    files: ['**/*.test.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.cjs', '**/*.config.js', 'setup.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.node
      }
    }
  }
];
