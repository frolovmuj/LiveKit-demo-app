module.exports = {
  root: true,
  env: { browser: true, es2020: true },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:react/jsx-runtime',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['apps/**/tsconfig.json', 'apps/**/tsconfig.web.json', 'packages/**/tsconfig.json'],
      },
    },
    'react': {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist', 'out', '.eslintrc.cjs', 'src/api/api.service.ts', 'node_modules/'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  overrides: [
    {
      files: ['apps/desktop-stream/scripts/**/*.{js,cjs}', '**/*.cjs'],
      env: { node: true },
      parserOptions: { sourceType: 'script' },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    '@typescript-eslint/no-empty-object-type': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'import/no-unresolved': 'error',
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: true,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    'import/order': [
      'error',
      {
        'groups': ['external', 'builtin', 'parent', ['sibling', 'index']],
        'newlines-between': 'never',
        'pathGroups': [
          {
            group: 'external',
            pattern: 'react',
            position: 'before',
          },
          {
            group: 'external',
            pattern: '@*/**',
            position: 'after',
          },
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            importNames: ['default'],
            message: 'No import React as default',
          },
        ],
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/display-name': 'error',
  },
};
