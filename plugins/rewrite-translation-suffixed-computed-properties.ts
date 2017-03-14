import * as Babel from 'babel-core';
import { CallExpression, Node, ObjectProperty, ReturnStatement } from 'babel-types';
import { NodePath, Visitor } from 'babel-traverse';

const PATTERN = /Translation$/;

function findEnclosingTranslatedComputedProperty(t: typeof Babel.types, path: NodePath<Node>): NodePath<ObjectProperty> | null {
  if (t.isFunctionExpression(path.node)) {
    let parentPath = path.parentPath;

    if (!t.isCallExpression(parentPath.node)) {
      return null;
    }

    let grandparentPath = parentPath.parentPath;

    if (!t.isObjectProperty(grandparentPath.node)) {
      return null;
    }

    return grandparentPath as NodePath<ObjectProperty>;
  }

  if (t.isFunctionDeclaration(path.node) || t.isArrowFunctionExpression(path.node)) {
    return null;
  }

  if (path.parentPath) {
    return findEnclosingTranslatedComputedProperty(t, path.parentPath);
  }

  return null;
}

class TranslatedComputedProperty {
  returns: Array<NodePath<ReturnStatement>> = [];

  constructor(
    readonly objectProperty: any,
  ) {}

  addReturnIfMatching(t: typeof Babel.types, returnStatementPath: NodePath<ReturnStatement>) {
    let returnStatement = returnStatementPath.node;

    if (
      !returnStatement.argument ||
      (
        !t.isStringLiteral(returnStatement.argument) &&
        !t.isTemplateLiteral(returnStatement.argument)
      )
    ) {
      return;
    }

    let translatedComputedPropertyPath = findEnclosingTranslatedComputedProperty(t, returnStatementPath);

    if (!translatedComputedPropertyPath) {
      return;
    }

    if (translatedComputedPropertyPath.node !== this.objectProperty) {
      return;
    }

    this.returns.push(returnStatementPath);
  }

  rewrite(t: typeof Babel.types): boolean {
    if (this.returns.length === 0) {
      return false;
    }

    this.objectProperty.key.name = this.objectProperty.key.name.replace(PATTERN, '');

    for (let returnStatementPath of this.returns) {
      returnStatementPath.node.argument = t.callExpression(
        t.identifier('t'),
        [returnStatementPath.node.argument]
      );
    }

    return true;
  }

  static matches(t: typeof Babel.types, objectProperty: ObjectProperty): boolean {
    let key = objectProperty.key;
    let value = objectProperty.value;

    if (!t.isIdentifier(key)) {
      return false;
    }

    if (!t.isCallExpression(value)) {
      return false;
    }

    let lastArgument = value.arguments[value.arguments.length - 1];

    if (!t.isFunctionExpression(lastArgument)) {
      return false;
    }

    return PATTERN.test(key.name);
  }
}

export default function rewriteTranslationSuffixedComputedProperties(babel: typeof Babel): { visitor: Visitor } {
  let t = babel.types;
  let enclosingFunctions: Array<any> = [];
  let enclosingFunction = null;
  let translatedComputedPropertyStack: Array<TranslatedComputedProperty> = [];

  return {
    visitor: {
      ObjectProperty: {
        enter(path: NodePath<ObjectProperty>) {
          if (TranslatedComputedProperty.matches(t, path.node)) {
            translatedComputedPropertyStack.push(new TranslatedComputedProperty(
              path.node
            ));
          }
        },

        exit(path: NodePath<ObjectProperty>) {
          if (TranslatedComputedProperty.matches(t, path.node)) {
            let translatedComputedProperty = translatedComputedPropertyStack.pop();

            if (translatedComputedProperty) {
              translatedComputedProperty.rewrite(t);
            }
          }
        }
      },

      ReturnStatement(path: NodePath<ReturnStatement>) {
        let translatedComputedProperty = translatedComputedPropertyStack[translatedComputedPropertyStack.length - 1];

        if (translatedComputedProperty) {
          translatedComputedProperty.addReturnIfMatching(t, path);
        }
      }
    }
  };
}
