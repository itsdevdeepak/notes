import globals from 'globals';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-flavor'],
  {
    files: ['src/**/*.js'],
    plugins: {
      jsdoc
    },
    languageOptions: { globals: globals.browser }
  },
  prettierConfig
];
