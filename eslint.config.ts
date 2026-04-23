// eslint.config.js
import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default ts.config(
  {
    ignores: ['command.js', 'commands/**'],
  },
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      indent: 'off',
      'svelte/indent': 'off',
    },
  },
);
