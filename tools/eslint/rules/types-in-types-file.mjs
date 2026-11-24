/**
 * Keeps type declarations and runtime code apart.
 *
 * - Outside `types.ts` files, exported `interface`s and `type` aliases are not
 *   allowed: shared types live in the `types.ts` of their folder. Types that
 *   are only used inside one file may stay there, unexported.
 * - A `types.ts` file contains only types: imports, `interface`s, `type`
 *   aliases and type-only re-exports, but no runtime code.
 *
 * Barrel files (`index.ts`) may re-export types.
 */

const TYPE_DECLARATIONS = new Set([
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
]);

/**
 * @param {string} filename
 * @returns {string}
 */
function baseName(filename) {
  return filename.split(/[\\/]/).pop() ?? filename;
}

/**
 * @param {import('estree').Node} statement
 * @returns {boolean}
 */
function isTypeOnlyStatement(statement) {
  switch (statement.type) {
    case 'ImportDeclaration':
      return true;
    case 'ExportNamedDeclaration':
      return statement.declaration
        ? TYPE_DECLARATIONS.has(statement.declaration.type)
        : statement.exportKind === 'type';
    case 'ExportAllDeclaration':
      return statement.exportKind === 'type';
    default:
      return TYPE_DECLARATIONS.has(statement.type);
  }
}

/** @type {import('eslint').Rule.RuleModule} */
export const typesInTypesFile = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Exported types live in types.ts; types.ts contains no runtime code',
    },
    schema: [],
    messages: {
      exportedType:
        "Move the exported type '{{name}}' to the folder's types.ts.",
      runtimeCode:
        'types.ts may only contain types; move runtime code elsewhere.',
    },
  },
  create(context) {
    const name = baseName(context.filename);
    if (name === 'index.ts') {
      return {};
    }
    if (name === 'types.ts') {
      return {
        Program(program) {
          for (const statement of program.body) {
            if (!isTypeOnlyStatement(statement)) {
              context.report({ node: statement, messageId: 'runtimeCode' });
            }
          }
        },
      };
    }
    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (declaration && TYPE_DECLARATIONS.has(declaration.type)) {
          context.report({
            node: declaration,
            messageId: 'exportedType',
            data: { name: declaration.id.name },
          });
        }
      },
    };
  },
};
