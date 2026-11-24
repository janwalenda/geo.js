import { type Rule, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import { geoPlugin } from '../../tools/eslint/plugin.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser, sourceType: 'module' },
});

/** A rule of the project plugin; fails the test run if it is missing. */
function rule(name: string): Rule.RuleModule {
  const found = geoPlugin.rules?.[name];
  if (!found) {
    throw new Error(`missing rule geo/${name}`);
  }
  return found;
}

tester.run('geo/types-in-types-file', rule('types-in-types-file'), {
  valid: [
    {
      name: 'unexported helper types stay next to the code',
      filename: 'src/render/compile.ts',
      code: 'interface Local { a: number }\nexport function f(): void {}',
    },
    {
      name: 'types.ts holds exported types and type imports',
      filename: 'src/render/types.ts',
      code: [
        "import type { Vec3 } from '../math/Vec3';",
        'export interface A { p: Vec3 }',
        'export type B = A | null;',
        "export type { C } from './other';",
      ].join('\n'),
    },
    {
      name: 'barrels may re-export types',
      filename: 'src/render/index.ts',
      code: "export type { A } from './types';\nexport type X = number;",
    },
  ],
  invalid: [
    {
      name: 'exported interface outside types.ts',
      filename: 'src/scene/Material.ts',
      code: 'export interface MaterialOptions { fill?: string }',
      errors: [
        { messageId: 'exportedType', data: { name: 'MaterialOptions' } },
      ],
    },
    {
      name: 'exported type alias outside types.ts',
      filename: 'src/scene/Material.ts',
      code: "export type Side = 'front' | 'back';",
      errors: [{ messageId: 'exportedType', data: { name: 'Side' } }],
    },
    {
      name: 'runtime code in types.ts',
      filename: 'src/scene/types.ts',
      code: 'export const DEFAULT = 1;\nexport function f(): void {}',
      errors: [{ messageId: 'runtimeCode' }, { messageId: 'runtimeCode' }],
    },
  ],
});

tester.run('geo/class-file-only-class', rule('class-file-only-class'), {
  valid: [
    {
      name: 'a class with constants',
      code: 'const LIMIT = 3;\nexport class A { f(): number { return LIMIT; } }',
    },
    {
      name: 'helper functions without a class',
      code: 'export function a(): void {}\nconst b = (): void => {};',
    },
  ],
  invalid: [
    {
      name: 'function declaration next to a class',
      code: 'export class A {}\nfunction helper(): void {}',
      errors: [{ messageId: 'helper', data: { name: 'helper' } }],
    },
    {
      name: 'exported arrow function next to a class',
      code: 'export const make = (): A => new A();\nexport class A {}',
      errors: [{ messageId: 'helper', data: { name: 'make' } }],
    },
  ],
});
