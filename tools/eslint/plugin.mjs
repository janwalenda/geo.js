/**
 * Project-specific ESLint rules of geo.js (see the rule files for details).
 */
import { classFileOnlyClass } from './rules/class-file-only-class.mjs';
import { typesInTypesFile } from './rules/types-in-types-file.mjs';

/** @type {import('eslint').ESLint.Plugin} */
export const geoPlugin = {
  meta: { name: 'eslint-plugin-geo' },
  rules: {
    'class-file-only-class': classFileOnlyClass,
    'types-in-types-file': typesInTypesFile,
  },
};
