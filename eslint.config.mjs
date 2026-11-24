/**
 * ESLint configuration of geo.js.
 *
 * Correctness and code quality are checked here; formatting is left to
 * Prettier (`eslint-config-prettier` switches off every rule that would
 * conflict with it). TypeScript files are linted with type information.
 */
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { geoPlugin } from './tools/eslint/plugin.mjs';

export default defineConfig(
  globalIgnores(['dist/', 'coverage/', 'node_modules/']),

  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },

  // ------------------------------------------------------------ all files
  js.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      unicorn,
    },
    rules: {
      // Blocks and control flow
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'default-case-last': 'error',

      // Size and complexity
      complexity: ['error', 12],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 3],
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      'max-statements': ['error', 25],
      'max-classes-per-file': ['error', 1],

      // Clarity
      'no-console': 'error',
      'no-param-reassign': 'error',
      'no-implicit-coercion': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-var': 'error',

      // Imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Selected unicorn rules
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-instanceof-builtins': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/prefer-export-from': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/throw-new-error': 'error',
    },
  },

  // ------------------------------------------------------------ TypeScript
  {
    files: ['**/*.ts'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' },
      ],
      '@typescript-eslint/max-params': ['error', { max: 4 }],
      // Fields, then constructor, accessors, methods (abstract ones last).
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'signature',
            'static-field',
            'instance-field',
            'abstract-field',
            'constructor',
            ['get', 'set'],
            'static-method',
            'instance-method',
            'abstract-method',
          ],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        { selector: 'function', format: ['camelCase'] },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },

  // ------------------------------------------------------------ library code
  {
    files: ['src/**/*.ts'],
    plugins: { geo: geoPlugin, jsdoc },
    extends: [jsdoc.configs['flat/recommended-typescript-error']],
    rules: {
      'geo/class-file-only-class': 'error',
      'geo/types-in-types-file': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports only.',
        },
      ],
      'unicorn/filename-case': [
        'error',
        {
          cases: { camelCase: true, pascalCase: true },
          // Class names with acronyms that are public API.
          ignore: [String.raw`^UVSphereGeometry\.ts$`],
        },
      ],
      // Every class, function, type and public method is documented;
      // overriding members inherit the documentation of their base class.
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: { ClassDeclaration: true, FunctionDeclaration: true },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'MethodDefinition[accessibility!="private"]' +
              '[accessibility!="protected"][override!=true]' +
              ':not([kind="constructor"])',
          ],
        },
      ],
      // Parameters and return values are typed; prose is enough.
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/tag-lines': 'off',
    },
  },

  // ------------------------------------------------------------ tests
  {
    files: ['test/**/*.ts'],
    rules: {
      // Test suites are long by nature; assertions may assert non-null.
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'max-nested-callbacks': ['error', 4],
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Mocks are often intentionally empty; local helpers need no
      // return type annotations (they are not module boundaries).
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // ------------------------------------------------------------ scripts
  {
    // Command-line scripts report on the console.
    files: ['test/dist/**', 'tools/**'],
    rules: { 'no-console': 'off' },
  },

  // ------------------------------------------------------------ JavaScript
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  // Formatting is Prettier's job: switch off conflicting rules (keep last) …
  prettier,
  // … except `curly`, which Prettier keeps intact with 'all', and the line
  // length: Prettier wraps code at 80, but not comments or long strings.
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: ['error', 'all'],
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
          // Test titles and expected markup are kept intact for grep-ability.
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
    },
  },
);
