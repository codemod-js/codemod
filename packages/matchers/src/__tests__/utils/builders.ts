import * as t from '@babel/types';
import * as m from '../../matchers';
import { parse } from '@codemod/parser';
import traverse, { NodePath } from '@babel/traverse';
import { Validator } from '../../../script/_utils/utils';
import { isNode } from '../../NodeTypes';

export type InterpolationValue =
  | t.Statement
  | t.Expression
  | Array<t.Statement>
  | Array<t.Expression>;

export interface BuilderKeysByType {
  [key: string]: Array<string>;
}

export interface NodeFieldsByType {
  [key: string]: NodeFields;
}

export interface NodeFields {
  [key: string]: NodeField;
}

export interface NodeField<T = unknown> {
  default: T | null;
  optional?: boolean;
  validate: Validator;
}

const PLACEHOLDERS = new Map([
  ['ArrayExpression', '[]'],
  ['AssignmentExpression', '$LEFT$ = $RIGHT$'],
  ['BlockStatement', '{}'],
  ['BreakStatement', 'break;'],
  ['BinaryExpression', '$LEFT$ == $RIGHT$'],
  ['CallExpression', '$CALL$()'],
  ['ContinueStatement', 'continue;'],
  ['ConditionalExpression', '$TEST$ ? $CONSEQUENT$ : $ALTERNATE$'],
  ['Directive', '"use strict";'],
  ['DirectiveLiteral', '"use strict";'],
  ['Identifier', '$IDENTIFIER$'],
  ['NumericLiteral', '0'],
  ['StringLiteral', '"$StringLiteral$"']
]);

export function access(
  path: string
): m.Matcher<t.MemberExpression | t.Identifier> {
  const [first, ...rest] = path.split('.');
  let result: m.Matcher<t.MemberExpression | t.Identifier> = m.identifier(
    first
  );

  for (const property of rest) {
    result = m.memberExpression(result, m.identifier(property));
  }

  return result;
}

export function addImport(
  importDeclaration: t.ImportDeclaration
): t.ImportDeclaration {
  return importDeclaration;
}

export function BuildStatements<
  R extends Array<t.Statement> = Array<t.Statement>
>(quasis: TemplateStringsArray, ...values: Array<InterpolationValue>): R {
  const offsetMap = new Map<number, InterpolationValue>();
  let code = quasis[0];

  for (let i = 0; i < values.length; i++) {
    const nextValue = values[i];

    if (isNode(nextValue)) {
      const placeholder = PLACEHOLDERS.get(nextValue.type);

      if (placeholder) {
        offsetMap.set(code.length, nextValue);
        code += placeholder;
      } else {
        throw new TypeError(
          `unsupported interpolated node type ${nextValue.type}`
        );
      }
    } else {
      throw new TypeError(`unexpected interpolated value: ${nextValue}`);
    }

    code += quasis[i + 1];
  }

  const ast = parse(code, {
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true
  });
  const replaced = new Map<number, InterpolationValue>();

  traverse(ast, {
    enter(path: NodePath<t.Node>): void {
      const start = path.node.start;
      if (typeof start === 'number') {
        const placeholder = offsetMap.get(start);
        if (Array.isArray(placeholder)) {
          replaced.set(start, placeholder);
          path.replaceWithMultiple(placeholder);
        } else if (placeholder && placeholder.type === path.node.type) {
          replaced.set(start, placeholder);
          path.replaceWith(placeholder);
          return;
        }
      }
    }
  });

  if (replaced.size !== offsetMap.size) {
    throw new Error(
      `replaced more or fewer values in matcher than expected: expected ${
        offsetMap.size
      }, replaced ${replaced.size}`
    );
  }

  return ast.program.body as R;
}

export function BuildStatement<R extends t.Statement = t.Statement>(
  quasis: TemplateStringsArray,
  ...values: Array<InterpolationValue>
): R {
  const statements = BuildStatements(quasis, ...values);

  if (statements.length !== 1) {
    throw new TypeError(`expected a single statement but ${statements.length}`);
  }

  return statements[0] as R;
}

export function BuildExpression<R extends t.Expression = t.Expression>(
  quasis: TemplateStringsArray,
  ...values: Array<InterpolationValue>
): R {
  const statements = BuildStatements(quasis, ...values);

  if (statements.length !== 1) {
    throw new TypeError(
      `expected a single expression but ${statements.length} statements`
    );
  }

  const statement = statements[0];

  if (!t.isExpressionStatement(statement)) {
    throw new TypeError(
      `expected a single expression but got a single ${statement.type}`
    );
  }

  return statement.expression as R;
}
