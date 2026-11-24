/**
 * A file that declares a class contains only that class: no top-level helper
 * functions next to it. Helpers belong in their own module (e.g.
 * `helpers.ts`), where they can be reused and tested on their own.
 *
 * Constants (non-function values) are still allowed next to the class.
 */

/**
 * @param {import('estree').Node | null | undefined} node
 * @returns {boolean}
 */
function isFunction(node) {
  return (
    node?.type === 'ArrowFunctionExpression' ||
    node?.type === 'FunctionExpression'
  );
}

/**
 * @param {import('estree').Node} statement
 * @returns {import('estree').Node}
 */
function unwrapExport(statement) {
  if (
    (statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration') &&
    statement.declaration
  ) {
    return statement.declaration;
  }
  return statement;
}

/** @type {import('eslint').Rule.RuleModule} */
export const classFileOnlyClass = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Files with a class contain no top-level helper functions',
    },
    schema: [],
    messages: {
      helper:
        "Move the helper function '{{name}}' out of this class file " +
        '(e.g. into a helpers module).',
    },
  },
  create(context) {
    return {
      Program(program) {
        const statements = program.body.map(unwrapExport);
        const hasClass = statements.some(
          (statement) => statement.type === 'ClassDeclaration',
        );
        if (!hasClass) {
          return;
        }
        for (const statement of statements) {
          if (statement.type === 'FunctionDeclaration') {
            context.report({
              node: statement,
              messageId: 'helper',
              data: { name: statement.id?.name ?? 'anonymous' },
            });
          }
          if (statement.type !== 'VariableDeclaration') {
            continue;
          }
          for (const declarator of statement.declarations) {
            if (isFunction(declarator.init)) {
              const name =
                declarator.id.type === 'Identifier'
                  ? declarator.id.name
                  : 'anonymous';
              context.report({
                node: declarator,
                messageId: 'helper',
                data: { name },
              });
            }
          }
        }
      },
    };
  },
};
