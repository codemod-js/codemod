import { PluginObj } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as m from '../src';

const className = m.capture(m.anyString());
const classDeclaration = m.capture(
  m.classDeclaration(
    m.identifier(className),
    null,
    m.classBody(
      m.arrayOf(
        m.classMethod(
          'method',
          m.identifier(),
          m.anything(),
          m.anything(),
          false,
          true
        )
      )
    )
  )
);
const exportDeclaration = m.capture(
  m.exportDefaultDeclaration(m.identifier(m.fromCapture(className)))
);
const matcher = m.anyList<t.Statement>(
  m.zeroOrMore(),
  classDeclaration,
  m.zeroOrMore(),
  exportDeclaration,
  m.zeroOrMore()
);

const thisPropertyAccessMatcher = m.memberExpression(
  m.thisExpression(),
  m.identifier(),
  false
);

export default function(): PluginObj {
  return {
    visitor: {
      Program(path: NodePath<t.Program>): void {
        m.match(
          matcher,
          { exportDeclaration, classDeclaration },
          path.node.body,
          ({ exportDeclaration, classDeclaration }) => {
            const statements = path.node.body;
            const replacements: Array<t.Statement> = [];
            const exportDeclarationPath = path.get('body')[
              statements.indexOf(exportDeclaration)
            ] as NodePath<t.ExportDefaultDeclaration>;
            const classDeclarationPath = path.get('body')[
              statements.indexOf(classDeclaration)
            ] as NodePath<t.ClassDeclaration>;

            for (const property of classDeclarationPath
              .get('body')
              .get('body')) {
              if (!property.isClassMethod()) {
                throw new Error(
                  `unexpected ${property.type} while looking for ClassMethod`
                );
              }

              if (!t.isIdentifier(property.node.key)) {
                throw new Error(
                  `unexpected ${
                    property.get('key').type
                  } while looking for Identifier`
                );
              }

              replacements.push(
                t.exportNamedDeclaration(
                  t.functionDeclaration(
                    property.node.key,
                    property.node.params,
                    property.node.body,
                    property.node.generator,
                    property.node.async
                  ),
                  []
                )
              );

              property.get('body').traverse({
                enter(path: NodePath<t.Node>): void {
                  if (path.isFunction()) {
                    if (!path.isArrowFunctionExpression()) {
                      path.skip();
                    }
                  } else if (
                    path.isMemberExpression() &&
                    thisPropertyAccessMatcher.match(path.node)
                  ) {
                    path.replaceWith(path.node.property);
                  }
                }
              });
            }

            exportDeclarationPath.remove();
            classDeclarationPath.replaceWithMultiple(replacements);
          }
        );
      }
    }
  };
}
