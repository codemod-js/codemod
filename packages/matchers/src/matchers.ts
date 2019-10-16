/* eslint-disable */
import * as t from '@babel/types';

export * from './matchers/spacers';
export { default as Function } from './matchers/Function';
export { default as Matcher } from './matchers/Matcher';
export { default as anyExpression } from './matchers/anyExpression';
export { default as anyList } from './matchers/anyList';
export { default as anyNode } from './matchers/anyNode';
export { default as anyNumber } from './matchers/anyNumber';
export { default as anyStatement } from './matchers/anyStatement';
export { default as anyString } from './matchers/anyString';
export { default as anything } from './matchers/anything';
export { default as arrayOf } from './matchers/arrayOf';
export {
  default as capture,
  CaptureBase,
  CapturedMatcher
} from './matchers/capture';
export { default as containerOf } from './matchers/containerOf';
export { default as fromCapture } from './matchers/fromCapture';
export { default as function } from './matchers/Function';
export { default as oneOf } from './matchers/oneOf';
export { default as or } from './matchers/or';
export { default as matcher } from './matchers/predicate';
export { default as tupleOf } from './matchers/tupleOf';

import tupleOf from './matchers/tupleOf';
import { isNode } from './NodeTypes';
import Matcher from './matchers/Matcher';

// aliases for keyword-named functions
export { Import as import };
export { Super as super };

export class AnyTypeAnnotationMatcher extends Matcher<t.AnyTypeAnnotation> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.AnyTypeAnnotation {
    if (!isNode(node) || !t.isAnyTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function anyTypeAnnotation(): Matcher<t.AnyTypeAnnotation> {
  return new AnyTypeAnnotationMatcher();
}

export class ArgumentPlaceholderMatcher extends Matcher<t.ArgumentPlaceholder> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ArgumentPlaceholder {
    if (!isNode(node) || !t.isArgumentPlaceholder(node)) {
      return false;
    }

    return true;
  }
}

export function argumentPlaceholder(): Matcher<t.ArgumentPlaceholder> {
  return new ArgumentPlaceholderMatcher();
}

export class ArrayExpressionMatcher extends Matcher<t.ArrayExpression> {
  constructor(
    private readonly elements?:
      | Matcher<Array<null | t.Expression | t.SpreadElement>>
      | Array<Matcher<null> | Matcher<t.Expression> | Matcher<t.SpreadElement>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ArrayExpression {
    if (!isNode(node) || !t.isArrayExpression(node)) {
      return false;
    }

    if (typeof this.elements === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.elements)) {
      if (
        !tupleOf<unknown>(...this.elements).matchValue(node.elements, [
          ...keys,
          'elements'
        ])
      ) {
        return false;
      }
    } else if (
      !this.elements.matchValue(node.elements, [...keys, 'elements'])
    ) {
      return false;
    }

    return true;
  }
}

export function arrayExpression(
  elements?:
    | Matcher<Array<null | t.Expression | t.SpreadElement>>
    | Array<Matcher<null> | Matcher<t.Expression> | Matcher<t.SpreadElement>>
): Matcher<t.ArrayExpression> {
  return new ArrayExpressionMatcher(elements);
}

export class ArrayPatternMatcher extends Matcher<t.ArrayPattern> {
  constructor(
    private readonly elements?:
      | Matcher<Array<t.PatternLike>>
      | Array<Matcher<t.PatternLike>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ArrayPattern {
    if (!isNode(node) || !t.isArrayPattern(node)) {
      return false;
    }

    if (typeof this.elements === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.elements)) {
      if (
        !tupleOf<unknown>(...this.elements).matchValue(node.elements, [
          ...keys,
          'elements'
        ])
      ) {
        return false;
      }
    } else if (
      !this.elements.matchValue(node.elements, [...keys, 'elements'])
    ) {
      return false;
    }

    return true;
  }
}

export function arrayPattern(
  elements?: Matcher<Array<t.PatternLike>> | Array<Matcher<t.PatternLike>>
): Matcher<t.ArrayPattern> {
  return new ArrayPatternMatcher(elements);
}

export class ArrayTypeAnnotationMatcher extends Matcher<t.ArrayTypeAnnotation> {
  constructor(private readonly elementType?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ArrayTypeAnnotation {
    if (!isNode(node) || !t.isArrayTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.elementType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.elementType.matchValue(node.elementType, [...keys, 'elementType'])
    ) {
      return false;
    }

    return true;
  }
}

export function arrayTypeAnnotation(
  elementType?: Matcher<t.FlowType>
): Matcher<t.ArrayTypeAnnotation> {
  return new ArrayTypeAnnotationMatcher(elementType);
}

export class ArrowFunctionExpressionMatcher extends Matcher<
  t.ArrowFunctionExpression
> {
  constructor(
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement | t.Expression>,
    private readonly async?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ArrowFunctionExpression {
    if (!isNode(node) || !t.isArrowFunctionExpression(node)) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.async === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.async === 'boolean') {
      if (this.async !== node.async) {
        return false;
      }
    } else if (this.async === null) {
      // null matcher means we expect null value
      if (node.async !== null) {
        return false;
      }
    } else if (node.async === null) {
      return false;
    } else if (!this.async.matchValue(node.async, [...keys, 'async'])) {
      return false;
    }

    return true;
  }
}

export function arrowFunctionExpression(
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement | t.Expression>,
  async?: Matcher<boolean> | boolean | null
): Matcher<t.ArrowFunctionExpression> {
  return new ArrowFunctionExpressionMatcher(params, body, async);
}

export class AssignmentExpressionMatcher extends Matcher<
  t.AssignmentExpression
> {
  constructor(
    private readonly operator?: Matcher<string> | string,
    private readonly left?: Matcher<t.LVal>,
    private readonly right?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.AssignmentExpression {
    if (!isNode(node) || !t.isAssignmentExpression(node)) {
      return false;
    }

    if (typeof this.operator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.operator === 'string') {
      if (this.operator !== node.operator) {
        return false;
      }
    } else if (
      !this.operator.matchValue(node.operator, [...keys, 'operator'])
    ) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function assignmentExpression(
  operator?: Matcher<string> | string,
  left?: Matcher<t.LVal>,
  right?: Matcher<t.Expression>
): Matcher<t.AssignmentExpression> {
  return new AssignmentExpressionMatcher(operator, left, right);
}

export class AssignmentPatternMatcher extends Matcher<t.AssignmentPattern> {
  constructor(
    private readonly left?: Matcher<
      t.Identifier | t.ObjectPattern | t.ArrayPattern | t.MemberExpression
    >,
    private readonly right?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.AssignmentPattern {
    if (!isNode(node) || !t.isAssignmentPattern(node)) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function assignmentPattern(
  left?: Matcher<
    t.Identifier | t.ObjectPattern | t.ArrayPattern | t.MemberExpression
  >,
  right?: Matcher<t.Expression>
): Matcher<t.AssignmentPattern> {
  return new AssignmentPatternMatcher(left, right);
}

export class AwaitExpressionMatcher extends Matcher<t.AwaitExpression> {
  constructor(private readonly argument?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.AwaitExpression {
    if (!isNode(node) || !t.isAwaitExpression(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function awaitExpression(
  argument?: Matcher<t.Expression>
): Matcher<t.AwaitExpression> {
  return new AwaitExpressionMatcher(argument);
}

export class BigIntLiteralMatcher extends Matcher<t.BigIntLiteral> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BigIntLiteral {
    if (!isNode(node) || !t.isBigIntLiteral(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function bigIntLiteral(
  value?: Matcher<string> | string
): Matcher<t.BigIntLiteral> {
  return new BigIntLiteralMatcher(value);
}

export class BinaryExpressionMatcher extends Matcher<t.BinaryExpression> {
  constructor(
    private readonly operator?:
      | Matcher<
          | '+'
          | '-'
          | '/'
          | '%'
          | '*'
          | '**'
          | '&'
          | '|'
          | '>>'
          | '>>>'
          | '<<'
          | '^'
          | '=='
          | '==='
          | '!='
          | '!=='
          | 'in'
          | 'instanceof'
          | '>'
          | '<'
          | '>='
          | '<='
        >
      | string,
    private readonly left?: Matcher<t.Expression>,
    private readonly right?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BinaryExpression {
    if (!isNode(node) || !t.isBinaryExpression(node)) {
      return false;
    }

    if (typeof this.operator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.operator === 'string') {
      if (this.operator !== node.operator) {
        return false;
      }
    } else if (
      !this.operator.matchValue(node.operator, [...keys, 'operator'])
    ) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function binaryExpression(
  operator?:
    | Matcher<
        | '+'
        | '-'
        | '/'
        | '%'
        | '*'
        | '**'
        | '&'
        | '|'
        | '>>'
        | '>>>'
        | '<<'
        | '^'
        | '=='
        | '==='
        | '!='
        | '!=='
        | 'in'
        | 'instanceof'
        | '>'
        | '<'
        | '>='
        | '<='
      >
    | string,
  left?: Matcher<t.Expression>,
  right?: Matcher<t.Expression>
): Matcher<t.BinaryExpression> {
  return new BinaryExpressionMatcher(operator, left, right);
}

export class BindExpressionMatcher extends Matcher<t.BindExpression> {
  constructor(
    private readonly object?: Matcher<any>,
    private readonly callee?: Matcher<any>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BindExpression {
    if (!isNode(node) || !t.isBindExpression(node)) {
      return false;
    }

    if (typeof this.object === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.object.matchValue(node.object, [...keys, 'object'])) {
      return false;
    }

    if (typeof this.callee === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.callee.matchValue(node.callee, [...keys, 'callee'])) {
      return false;
    }

    return true;
  }
}

export function bindExpression(
  object?: Matcher<any>,
  callee?: Matcher<any>
): Matcher<t.BindExpression> {
  return new BindExpressionMatcher(object, callee);
}

export class BlockStatementMatcher extends Matcher<t.BlockStatement> {
  constructor(
    private readonly body?:
      | Matcher<Array<t.Statement>>
      | Array<Matcher<t.Statement>>,
    private readonly directives?:
      | Matcher<Array<t.Directive>>
      | Array<Matcher<t.Directive>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BlockStatement {
    if (!isNode(node) || !t.isBlockStatement(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.body)) {
      if (
        !tupleOf<unknown>(...this.body).matchValue(node.body, [...keys, 'body'])
      ) {
        return false;
      }
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.directives === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.directives)) {
      if (
        !tupleOf<unknown>(...this.directives).matchValue(node.directives, [
          ...keys,
          'directives'
        ])
      ) {
        return false;
      }
    } else if (
      !this.directives.matchValue(node.directives, [...keys, 'directives'])
    ) {
      return false;
    }

    return true;
  }
}

export function blockStatement(
  body?: Matcher<Array<t.Statement>> | Array<Matcher<t.Statement>>,
  directives?: Matcher<Array<t.Directive>> | Array<Matcher<t.Directive>>
): Matcher<t.BlockStatement> {
  return new BlockStatementMatcher(body, directives);
}

export class BooleanLiteralMatcher extends Matcher<t.BooleanLiteral> {
  constructor(private readonly value?: Matcher<boolean> | boolean) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BooleanLiteral {
    if (!isNode(node) || !t.isBooleanLiteral(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'boolean') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function booleanLiteral(
  value?: Matcher<boolean> | boolean
): Matcher<t.BooleanLiteral> {
  return new BooleanLiteralMatcher(value);
}

export class BooleanLiteralTypeAnnotationMatcher extends Matcher<
  t.BooleanLiteralTypeAnnotation
> {
  constructor(private readonly value?: Matcher<boolean> | boolean) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BooleanLiteralTypeAnnotation {
    if (!isNode(node) || !t.isBooleanLiteralTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'boolean') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function booleanLiteralTypeAnnotation(
  value?: Matcher<boolean> | boolean
): Matcher<t.BooleanLiteralTypeAnnotation> {
  return new BooleanLiteralTypeAnnotationMatcher(value);
}

export class BooleanTypeAnnotationMatcher extends Matcher<
  t.BooleanTypeAnnotation
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BooleanTypeAnnotation {
    if (!isNode(node) || !t.isBooleanTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function booleanTypeAnnotation(): Matcher<t.BooleanTypeAnnotation> {
  return new BooleanTypeAnnotationMatcher();
}

export class BreakStatementMatcher extends Matcher<t.BreakStatement> {
  constructor(private readonly label?: Matcher<t.Identifier> | null) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.BreakStatement {
    if (!isNode(node) || !t.isBreakStatement(node)) {
      return false;
    }

    if (typeof this.label === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.label === null) {
      // null matcher means we expect null value
      if (node.label !== null) {
        return false;
      }
    } else if (node.label === null) {
      return false;
    } else if (!this.label.matchValue(node.label, [...keys, 'label'])) {
      return false;
    }

    return true;
  }
}

export function breakStatement(
  label?: Matcher<t.Identifier> | null
): Matcher<t.BreakStatement> {
  return new BreakStatementMatcher(label);
}

export class CallExpressionMatcher extends Matcher<t.CallExpression> {
  constructor(
    private readonly callee?: Matcher<t.Expression | t.V8IntrinsicIdentifier>,
    private readonly _arguments?:
      | Matcher<
          Array<
            | t.Expression
            | t.SpreadElement
            | t.JSXNamespacedName
            | t.ArgumentPlaceholder
          >
        >
      | Array<
          | Matcher<t.Expression>
          | Matcher<t.SpreadElement>
          | Matcher<t.JSXNamespacedName>
          | Matcher<t.ArgumentPlaceholder>
        >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.CallExpression {
    if (!isNode(node) || !t.isCallExpression(node)) {
      return false;
    }

    if (typeof this.callee === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.callee.matchValue(node.callee, [...keys, 'callee'])) {
      return false;
    }

    if (typeof this._arguments === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this._arguments)) {
      if (
        !tupleOf<unknown>(...this._arguments).matchValue(node.arguments, [
          ...keys,
          'arguments'
        ])
      ) {
        return false;
      }
    } else if (
      !this._arguments.matchValue(node.arguments, [...keys, 'arguments'])
    ) {
      return false;
    }

    return true;
  }
}

export function callExpression(
  callee?: Matcher<t.Expression | t.V8IntrinsicIdentifier>,
  _arguments?:
    | Matcher<
        Array<
          | t.Expression
          | t.SpreadElement
          | t.JSXNamespacedName
          | t.ArgumentPlaceholder
        >
      >
    | Array<
        | Matcher<t.Expression>
        | Matcher<t.SpreadElement>
        | Matcher<t.JSXNamespacedName>
        | Matcher<t.ArgumentPlaceholder>
      >
): Matcher<t.CallExpression> {
  return new CallExpressionMatcher(callee, _arguments);
}

export class CatchClauseMatcher extends Matcher<t.CatchClause> {
  constructor(
    private readonly param?: Matcher<t.Identifier> | null,
    private readonly body?: Matcher<t.BlockStatement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.CatchClause {
    if (!isNode(node) || !t.isCatchClause(node)) {
      return false;
    }

    if (typeof this.param === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.param === null) {
      // null matcher means we expect null value
      if (node.param !== null) {
        return false;
      }
    } else if (node.param === null) {
      return false;
    } else if (!this.param.matchValue(node.param, [...keys, 'param'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function catchClause(
  param?: Matcher<t.Identifier> | null,
  body?: Matcher<t.BlockStatement>
): Matcher<t.CatchClause> {
  return new CatchClauseMatcher(param, body);
}

export class ClassBodyMatcher extends Matcher<t.ClassBody> {
  constructor(
    private readonly body?:
      | Matcher<
          Array<
            | t.ClassMethod
            | t.ClassPrivateMethod
            | t.ClassProperty
            | t.ClassPrivateProperty
            | t.TSDeclareMethod
            | t.TSIndexSignature
          >
        >
      | Array<
          | Matcher<t.ClassMethod>
          | Matcher<t.ClassPrivateMethod>
          | Matcher<t.ClassProperty>
          | Matcher<t.ClassPrivateProperty>
          | Matcher<t.TSDeclareMethod>
          | Matcher<t.TSIndexSignature>
        >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassBody {
    if (!isNode(node) || !t.isClassBody(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.body)) {
      if (
        !tupleOf<unknown>(...this.body).matchValue(node.body, [...keys, 'body'])
      ) {
        return false;
      }
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function classBody(
  body?:
    | Matcher<
        Array<
          | t.ClassMethod
          | t.ClassPrivateMethod
          | t.ClassProperty
          | t.ClassPrivateProperty
          | t.TSDeclareMethod
          | t.TSIndexSignature
        >
      >
    | Array<
        | Matcher<t.ClassMethod>
        | Matcher<t.ClassPrivateMethod>
        | Matcher<t.ClassProperty>
        | Matcher<t.ClassPrivateProperty>
        | Matcher<t.TSDeclareMethod>
        | Matcher<t.TSIndexSignature>
      >
): Matcher<t.ClassBody> {
  return new ClassBodyMatcher(body);
}

export class ClassDeclarationMatcher extends Matcher<t.ClassDeclaration> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly superClass?: Matcher<t.Expression> | null,
    private readonly body?: Matcher<t.ClassBody>,
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassDeclaration {
    if (!isNode(node) || !t.isClassDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.superClass === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.superClass === null) {
      // null matcher means we expect null value
      if (node.superClass !== null) {
        return false;
      }
    } else if (node.superClass === null) {
      return false;
    } else if (
      !this.superClass.matchValue(node.superClass, [...keys, 'superClass'])
    ) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    return true;
  }
}

export function classDeclaration(
  id?: Matcher<t.Identifier> | null,
  superClass?: Matcher<t.Expression> | null,
  body?: Matcher<t.ClassBody>,
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null
): Matcher<t.ClassDeclaration> {
  return new ClassDeclarationMatcher(id, superClass, body, decorators);
}

export class ClassExpressionMatcher extends Matcher<t.ClassExpression> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly superClass?: Matcher<t.Expression> | null,
    private readonly body?: Matcher<t.ClassBody>,
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassExpression {
    if (!isNode(node) || !t.isClassExpression(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.superClass === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.superClass === null) {
      // null matcher means we expect null value
      if (node.superClass !== null) {
        return false;
      }
    } else if (node.superClass === null) {
      return false;
    } else if (
      !this.superClass.matchValue(node.superClass, [...keys, 'superClass'])
    ) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    return true;
  }
}

export function classExpression(
  id?: Matcher<t.Identifier> | null,
  superClass?: Matcher<t.Expression> | null,
  body?: Matcher<t.ClassBody>,
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null
): Matcher<t.ClassExpression> {
  return new ClassExpressionMatcher(id, superClass, body, decorators);
}

export class ClassImplementsMatcher extends Matcher<t.ClassImplements> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassImplements {
    if (!isNode(node) || !t.isClassImplements(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function classImplements(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterInstantiation> | null
): Matcher<t.ClassImplements> {
  return new ClassImplementsMatcher(id, typeParameters);
}

export class ClassMethodMatcher extends Matcher<t.ClassMethod> {
  constructor(
    private readonly kind?:
      | Matcher<'get' | 'set' | 'method' | 'constructor'>
      | string
      | null,
    private readonly key?: Matcher<
      t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
    >,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly computed?: Matcher<boolean> | boolean | null,
    private readonly _static?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassMethod {
    if (!isNode(node) || !t.isClassMethod(node)) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (this.kind === null) {
      // null matcher means we expect null value
      if (node.kind !== null) {
        return false;
      }
    } else if (node.kind === null) {
      return false;
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (this.computed === null) {
      // null matcher means we expect null value
      if (node.computed !== null) {
        return false;
      }
    } else if (node.computed === null) {
      return false;
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    if (typeof this._static === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this._static === 'boolean') {
      if (this._static !== node.static) {
        return false;
      }
    } else if (this._static === null) {
      // null matcher means we expect null value
      if (node.static !== null) {
        return false;
      }
    } else if (node.static === null) {
      return false;
    } else if (!this._static.matchValue(node.static, [...keys, 'static'])) {
      return false;
    }

    return true;
  }
}

export function classMethod(
  kind?: Matcher<'get' | 'set' | 'method' | 'constructor'> | string | null,
  key?: Matcher<
    t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
  >,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement>,
  computed?: Matcher<boolean> | boolean | null,
  _static?: Matcher<boolean> | boolean | null
): Matcher<t.ClassMethod> {
  return new ClassMethodMatcher(kind, key, params, body, computed, _static);
}

export class ClassPrivateMethodMatcher extends Matcher<t.ClassPrivateMethod> {
  constructor(
    private readonly kind?:
      | Matcher<'get' | 'set' | 'method' | 'constructor'>
      | string
      | null,
    private readonly key?: Matcher<t.PrivateName>,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly _static?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassPrivateMethod {
    if (!isNode(node) || !t.isClassPrivateMethod(node)) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (this.kind === null) {
      // null matcher means we expect null value
      if (node.kind !== null) {
        return false;
      }
    } else if (node.kind === null) {
      return false;
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this._static === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this._static === 'boolean') {
      if (this._static !== node.static) {
        return false;
      }
    } else if (this._static === null) {
      // null matcher means we expect null value
      if (node.static !== null) {
        return false;
      }
    } else if (node.static === null) {
      return false;
    } else if (!this._static.matchValue(node.static, [...keys, 'static'])) {
      return false;
    }

    return true;
  }
}

export function classPrivateMethod(
  kind?: Matcher<'get' | 'set' | 'method' | 'constructor'> | string | null,
  key?: Matcher<t.PrivateName>,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement>,
  _static?: Matcher<boolean> | boolean | null
): Matcher<t.ClassPrivateMethod> {
  return new ClassPrivateMethodMatcher(kind, key, params, body, _static);
}

export class ClassPrivatePropertyMatcher extends Matcher<
  t.ClassPrivateProperty
> {
  constructor(
    private readonly key?: Matcher<t.PrivateName>,
    private readonly value?: Matcher<t.Expression> | null,
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassPrivateProperty {
    if (!isNode(node) || !t.isClassPrivateProperty(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.value === null) {
      // null matcher means we expect null value
      if (node.value !== null) {
        return false;
      }
    } else if (node.value === null) {
      return false;
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    return true;
  }
}

export function classPrivateProperty(
  key?: Matcher<t.PrivateName>,
  value?: Matcher<t.Expression> | null,
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null
): Matcher<t.ClassPrivateProperty> {
  return new ClassPrivatePropertyMatcher(key, value, decorators);
}

export class ClassPropertyMatcher extends Matcher<t.ClassProperty> {
  constructor(
    private readonly key?: Matcher<
      t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
    >,
    private readonly value?: Matcher<t.Expression> | null,
    private readonly typeAnnotation?: Matcher<
      t.TypeAnnotation | t.TSTypeAnnotation | t.Noop
    > | null,
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null,
    private readonly computed?: Matcher<boolean> | boolean | null,
    private readonly _static?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ClassProperty {
    if (!isNode(node) || !t.isClassProperty(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.value === null) {
      // null matcher means we expect null value
      if (node.value !== null) {
        return false;
      }
    } else if (node.value === null) {
      return false;
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (this.computed === null) {
      // null matcher means we expect null value
      if (node.computed !== null) {
        return false;
      }
    } else if (node.computed === null) {
      return false;
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    if (typeof this._static === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this._static === 'boolean') {
      if (this._static !== node.static) {
        return false;
      }
    } else if (this._static === null) {
      // null matcher means we expect null value
      if (node.static !== null) {
        return false;
      }
    } else if (node.static === null) {
      return false;
    } else if (!this._static.matchValue(node.static, [...keys, 'static'])) {
      return false;
    }

    return true;
  }
}

export function classProperty(
  key?: Matcher<
    t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
  >,
  value?: Matcher<t.Expression> | null,
  typeAnnotation?: Matcher<
    t.TypeAnnotation | t.TSTypeAnnotation | t.Noop
  > | null,
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null,
  computed?: Matcher<boolean> | boolean | null,
  _static?: Matcher<boolean> | boolean | null
): Matcher<t.ClassProperty> {
  return new ClassPropertyMatcher(
    key,
    value,
    typeAnnotation,
    decorators,
    computed,
    _static
  );
}

export class ConditionalExpressionMatcher extends Matcher<
  t.ConditionalExpression
> {
  constructor(
    private readonly test?: Matcher<t.Expression>,
    private readonly consequent?: Matcher<t.Expression>,
    private readonly alternate?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ConditionalExpression {
    if (!isNode(node) || !t.isConditionalExpression(node)) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.consequent === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.consequent.matchValue(node.consequent, [...keys, 'consequent'])
    ) {
      return false;
    }

    if (typeof this.alternate === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.alternate.matchValue(node.alternate, [...keys, 'alternate'])
    ) {
      return false;
    }

    return true;
  }
}

export function conditionalExpression(
  test?: Matcher<t.Expression>,
  consequent?: Matcher<t.Expression>,
  alternate?: Matcher<t.Expression>
): Matcher<t.ConditionalExpression> {
  return new ConditionalExpressionMatcher(test, consequent, alternate);
}

export class ContinueStatementMatcher extends Matcher<t.ContinueStatement> {
  constructor(private readonly label?: Matcher<t.Identifier> | null) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ContinueStatement {
    if (!isNode(node) || !t.isContinueStatement(node)) {
      return false;
    }

    if (typeof this.label === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.label === null) {
      // null matcher means we expect null value
      if (node.label !== null) {
        return false;
      }
    } else if (node.label === null) {
      return false;
    } else if (!this.label.matchValue(node.label, [...keys, 'label'])) {
      return false;
    }

    return true;
  }
}

export function continueStatement(
  label?: Matcher<t.Identifier> | null
): Matcher<t.ContinueStatement> {
  return new ContinueStatementMatcher(label);
}

export class DebuggerStatementMatcher extends Matcher<t.DebuggerStatement> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DebuggerStatement {
    if (!isNode(node) || !t.isDebuggerStatement(node)) {
      return false;
    }

    return true;
  }
}

export function debuggerStatement(): Matcher<t.DebuggerStatement> {
  return new DebuggerStatementMatcher();
}

export class DeclareClassMatcher extends Matcher<t.DeclareClass> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly _extends?:
      | Matcher<Array<t.InterfaceExtends>>
      | Array<Matcher<t.InterfaceExtends>>
      | null,
    private readonly body?: Matcher<t.ObjectTypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareClass {
    if (!isNode(node) || !t.isDeclareClass(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this._extends === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._extends === null) {
      // null matcher means we expect null value
      if (node.extends !== null) {
        return false;
      }
    } else if (node.extends === null) {
      return false;
    } else if (Array.isArray(this._extends)) {
      if (
        !tupleOf<unknown>(...this._extends).matchValue(node.extends, [
          ...keys,
          'extends'
        ])
      ) {
        return false;
      }
    } else if (!this._extends.matchValue(node.extends, [...keys, 'extends'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function declareClass(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  _extends?:
    | Matcher<Array<t.InterfaceExtends>>
    | Array<Matcher<t.InterfaceExtends>>
    | null,
  body?: Matcher<t.ObjectTypeAnnotation>
): Matcher<t.DeclareClass> {
  return new DeclareClassMatcher(id, typeParameters, _extends, body);
}

export class DeclareExportAllDeclarationMatcher extends Matcher<
  t.DeclareExportAllDeclaration
> {
  constructor(private readonly source?: Matcher<t.StringLiteral>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareExportAllDeclaration {
    if (!isNode(node) || !t.isDeclareExportAllDeclaration(node)) {
      return false;
    }

    if (typeof this.source === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.source.matchValue(node.source, [...keys, 'source'])) {
      return false;
    }

    return true;
  }
}

export function declareExportAllDeclaration(
  source?: Matcher<t.StringLiteral>
): Matcher<t.DeclareExportAllDeclaration> {
  return new DeclareExportAllDeclarationMatcher(source);
}

export class DeclareExportDeclarationMatcher extends Matcher<
  t.DeclareExportDeclaration
> {
  constructor(
    private readonly declaration?: Matcher<t.Flow> | null,
    private readonly specifiers?:
      | Matcher<Array<t.ExportSpecifier | t.ExportNamespaceSpecifier>>
      | Array<Matcher<t.ExportSpecifier> | Matcher<t.ExportNamespaceSpecifier>>
      | null,
    private readonly source?: Matcher<t.StringLiteral> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareExportDeclaration {
    if (!isNode(node) || !t.isDeclareExportDeclaration(node)) {
      return false;
    }

    if (typeof this.declaration === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.declaration === null) {
      // null matcher means we expect null value
      if (node.declaration !== null) {
        return false;
      }
    } else if (node.declaration === null) {
      return false;
    } else if (
      !this.declaration.matchValue(node.declaration, [...keys, 'declaration'])
    ) {
      return false;
    }

    if (typeof this.specifiers === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.specifiers === null) {
      // null matcher means we expect null value
      if (node.specifiers !== null) {
        return false;
      }
    } else if (node.specifiers === null) {
      return false;
    } else if (Array.isArray(this.specifiers)) {
      if (
        !tupleOf<unknown>(...this.specifiers).matchValue(node.specifiers, [
          ...keys,
          'specifiers'
        ])
      ) {
        return false;
      }
    } else if (
      !this.specifiers.matchValue(node.specifiers, [...keys, 'specifiers'])
    ) {
      return false;
    }

    if (typeof this.source === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.source === null) {
      // null matcher means we expect null value
      if (node.source !== null) {
        return false;
      }
    } else if (node.source === null) {
      return false;
    } else if (!this.source.matchValue(node.source, [...keys, 'source'])) {
      return false;
    }

    return true;
  }
}

export function declareExportDeclaration(
  declaration?: Matcher<t.Flow> | null,
  specifiers?:
    | Matcher<Array<t.ExportSpecifier | t.ExportNamespaceSpecifier>>
    | Array<Matcher<t.ExportSpecifier> | Matcher<t.ExportNamespaceSpecifier>>
    | null,
  source?: Matcher<t.StringLiteral> | null
): Matcher<t.DeclareExportDeclaration> {
  return new DeclareExportDeclarationMatcher(declaration, specifiers, source);
}

export class DeclareFunctionMatcher extends Matcher<t.DeclareFunction> {
  constructor(private readonly id?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareFunction {
    if (!isNode(node) || !t.isDeclareFunction(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    return true;
  }
}

export function declareFunction(
  id?: Matcher<t.Identifier>
): Matcher<t.DeclareFunction> {
  return new DeclareFunctionMatcher(id);
}

export class DeclareInterfaceMatcher extends Matcher<t.DeclareInterface> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly _extends?:
      | Matcher<Array<t.InterfaceExtends>>
      | Array<Matcher<t.InterfaceExtends>>
      | null,
    private readonly body?: Matcher<t.ObjectTypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareInterface {
    if (!isNode(node) || !t.isDeclareInterface(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this._extends === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._extends === null) {
      // null matcher means we expect null value
      if (node.extends !== null) {
        return false;
      }
    } else if (node.extends === null) {
      return false;
    } else if (Array.isArray(this._extends)) {
      if (
        !tupleOf<unknown>(...this._extends).matchValue(node.extends, [
          ...keys,
          'extends'
        ])
      ) {
        return false;
      }
    } else if (!this._extends.matchValue(node.extends, [...keys, 'extends'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function declareInterface(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  _extends?:
    | Matcher<Array<t.InterfaceExtends>>
    | Array<Matcher<t.InterfaceExtends>>
    | null,
  body?: Matcher<t.ObjectTypeAnnotation>
): Matcher<t.DeclareInterface> {
  return new DeclareInterfaceMatcher(id, typeParameters, _extends, body);
}

export class DeclareModuleMatcher extends Matcher<t.DeclareModule> {
  constructor(
    private readonly id?: Matcher<t.Identifier | t.StringLiteral>,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly kind?: Matcher<'CommonJS' | 'ES'> | string | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareModule {
    if (!isNode(node) || !t.isDeclareModule(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (this.kind === null) {
      // null matcher means we expect null value
      if (node.kind !== null) {
        return false;
      }
    } else if (node.kind === null) {
      return false;
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    return true;
  }
}

export function declareModule(
  id?: Matcher<t.Identifier | t.StringLiteral>,
  body?: Matcher<t.BlockStatement>,
  kind?: Matcher<'CommonJS' | 'ES'> | string | null
): Matcher<t.DeclareModule> {
  return new DeclareModuleMatcher(id, body, kind);
}

export class DeclareModuleExportsMatcher extends Matcher<
  t.DeclareModuleExports
> {
  constructor(private readonly typeAnnotation?: Matcher<t.TypeAnnotation>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareModuleExports {
    if (!isNode(node) || !t.isDeclareModuleExports(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function declareModuleExports(
  typeAnnotation?: Matcher<t.TypeAnnotation>
): Matcher<t.DeclareModuleExports> {
  return new DeclareModuleExportsMatcher(typeAnnotation);
}

export class DeclareOpaqueTypeMatcher extends Matcher<t.DeclareOpaqueType> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly supertype?: Matcher<t.FlowType> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareOpaqueType {
    if (!isNode(node) || !t.isDeclareOpaqueType(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.supertype === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.supertype === null) {
      // null matcher means we expect null value
      if (node.supertype !== null) {
        return false;
      }
    } else if (node.supertype === null) {
      return false;
    } else if (
      !this.supertype.matchValue(node.supertype, [...keys, 'supertype'])
    ) {
      return false;
    }

    return true;
  }
}

export function declareOpaqueType(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  supertype?: Matcher<t.FlowType> | null
): Matcher<t.DeclareOpaqueType> {
  return new DeclareOpaqueTypeMatcher(id, typeParameters, supertype);
}

export class DeclareTypeAliasMatcher extends Matcher<t.DeclareTypeAlias> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly right?: Matcher<t.FlowType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareTypeAlias {
    if (!isNode(node) || !t.isDeclareTypeAlias(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function declareTypeAlias(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  right?: Matcher<t.FlowType>
): Matcher<t.DeclareTypeAlias> {
  return new DeclareTypeAliasMatcher(id, typeParameters, right);
}

export class DeclareVariableMatcher extends Matcher<t.DeclareVariable> {
  constructor(private readonly id?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclareVariable {
    if (!isNode(node) || !t.isDeclareVariable(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    return true;
  }
}

export function declareVariable(
  id?: Matcher<t.Identifier>
): Matcher<t.DeclareVariable> {
  return new DeclareVariableMatcher(id);
}

export class DeclaredPredicateMatcher extends Matcher<t.DeclaredPredicate> {
  constructor(private readonly value?: Matcher<t.Flow>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DeclaredPredicate {
    if (!isNode(node) || !t.isDeclaredPredicate(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function declaredPredicate(
  value?: Matcher<t.Flow>
): Matcher<t.DeclaredPredicate> {
  return new DeclaredPredicateMatcher(value);
}

export class DecoratorMatcher extends Matcher<t.Decorator> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Decorator {
    if (!isNode(node) || !t.isDecorator(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function decorator(
  expression?: Matcher<t.Expression>
): Matcher<t.Decorator> {
  return new DecoratorMatcher(expression);
}

export class DirectiveMatcher extends Matcher<t.Directive> {
  constructor(private readonly value?: Matcher<t.DirectiveLiteral>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Directive {
    if (!isNode(node) || !t.isDirective(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function directive(
  value?: Matcher<t.DirectiveLiteral>
): Matcher<t.Directive> {
  return new DirectiveMatcher(value);
}

export class DirectiveLiteralMatcher extends Matcher<t.DirectiveLiteral> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DirectiveLiteral {
    if (!isNode(node) || !t.isDirectiveLiteral(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function directiveLiteral(
  value?: Matcher<string> | string
): Matcher<t.DirectiveLiteral> {
  return new DirectiveLiteralMatcher(value);
}

export class DoExpressionMatcher extends Matcher<t.DoExpression> {
  constructor(private readonly body?: Matcher<t.BlockStatement>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DoExpression {
    if (!isNode(node) || !t.isDoExpression(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function doExpression(
  body?: Matcher<t.BlockStatement>
): Matcher<t.DoExpression> {
  return new DoExpressionMatcher(body);
}

export class DoWhileStatementMatcher extends Matcher<t.DoWhileStatement> {
  constructor(
    private readonly test?: Matcher<t.Expression>,
    private readonly body?: Matcher<t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.DoWhileStatement {
    if (!isNode(node) || !t.isDoWhileStatement(node)) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function doWhileStatement(
  test?: Matcher<t.Expression>,
  body?: Matcher<t.Statement>
): Matcher<t.DoWhileStatement> {
  return new DoWhileStatementMatcher(test, body);
}

export class EmptyStatementMatcher extends Matcher<t.EmptyStatement> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.EmptyStatement {
    if (!isNode(node) || !t.isEmptyStatement(node)) {
      return false;
    }

    return true;
  }
}

export function emptyStatement(): Matcher<t.EmptyStatement> {
  return new EmptyStatementMatcher();
}

export class EmptyTypeAnnotationMatcher extends Matcher<t.EmptyTypeAnnotation> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.EmptyTypeAnnotation {
    if (!isNode(node) || !t.isEmptyTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function emptyTypeAnnotation(): Matcher<t.EmptyTypeAnnotation> {
  return new EmptyTypeAnnotationMatcher();
}

export class ExistsTypeAnnotationMatcher extends Matcher<
  t.ExistsTypeAnnotation
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExistsTypeAnnotation {
    if (!isNode(node) || !t.isExistsTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function existsTypeAnnotation(): Matcher<t.ExistsTypeAnnotation> {
  return new ExistsTypeAnnotationMatcher();
}

export class ExportAllDeclarationMatcher extends Matcher<
  t.ExportAllDeclaration
> {
  constructor(private readonly source?: Matcher<t.StringLiteral>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportAllDeclaration {
    if (!isNode(node) || !t.isExportAllDeclaration(node)) {
      return false;
    }

    if (typeof this.source === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.source.matchValue(node.source, [...keys, 'source'])) {
      return false;
    }

    return true;
  }
}

export function exportAllDeclaration(
  source?: Matcher<t.StringLiteral>
): Matcher<t.ExportAllDeclaration> {
  return new ExportAllDeclarationMatcher(source);
}

export class ExportDefaultDeclarationMatcher extends Matcher<
  t.ExportDefaultDeclaration
> {
  constructor(
    private readonly declaration?: Matcher<
      | t.FunctionDeclaration
      | t.TSDeclareFunction
      | t.ClassDeclaration
      | t.Expression
    >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportDefaultDeclaration {
    if (!isNode(node) || !t.isExportDefaultDeclaration(node)) {
      return false;
    }

    if (typeof this.declaration === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.declaration.matchValue(node.declaration, [...keys, 'declaration'])
    ) {
      return false;
    }

    return true;
  }
}

export function exportDefaultDeclaration(
  declaration?: Matcher<
    | t.FunctionDeclaration
    | t.TSDeclareFunction
    | t.ClassDeclaration
    | t.Expression
  >
): Matcher<t.ExportDefaultDeclaration> {
  return new ExportDefaultDeclarationMatcher(declaration);
}

export class ExportDefaultSpecifierMatcher extends Matcher<
  t.ExportDefaultSpecifier
> {
  constructor(private readonly exported?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportDefaultSpecifier {
    if (!isNode(node) || !t.isExportDefaultSpecifier(node)) {
      return false;
    }

    if (typeof this.exported === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.exported.matchValue(node.exported, [...keys, 'exported'])
    ) {
      return false;
    }

    return true;
  }
}

export function exportDefaultSpecifier(
  exported?: Matcher<t.Identifier>
): Matcher<t.ExportDefaultSpecifier> {
  return new ExportDefaultSpecifierMatcher(exported);
}

export class ExportNamedDeclarationMatcher extends Matcher<
  t.ExportNamedDeclaration
> {
  constructor(
    private readonly declaration?: Matcher<t.Declaration> | null,
    private readonly specifiers?:
      | Matcher<
          Array<
            | t.ExportSpecifier
            | t.ExportDefaultSpecifier
            | t.ExportNamespaceSpecifier
          >
        >
      | Array<
          | Matcher<t.ExportSpecifier>
          | Matcher<t.ExportDefaultSpecifier>
          | Matcher<t.ExportNamespaceSpecifier>
        >,
    private readonly source?: Matcher<t.StringLiteral> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportNamedDeclaration {
    if (!isNode(node) || !t.isExportNamedDeclaration(node)) {
      return false;
    }

    if (typeof this.declaration === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.declaration === null) {
      // null matcher means we expect null value
      if (node.declaration !== null) {
        return false;
      }
    } else if (node.declaration === null) {
      return false;
    } else if (
      !this.declaration.matchValue(node.declaration, [...keys, 'declaration'])
    ) {
      return false;
    }

    if (typeof this.specifiers === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.specifiers)) {
      if (
        !tupleOf<unknown>(...this.specifiers).matchValue(node.specifiers, [
          ...keys,
          'specifiers'
        ])
      ) {
        return false;
      }
    } else if (
      !this.specifiers.matchValue(node.specifiers, [...keys, 'specifiers'])
    ) {
      return false;
    }

    if (typeof this.source === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.source === null) {
      // null matcher means we expect null value
      if (node.source !== null) {
        return false;
      }
    } else if (node.source === null) {
      return false;
    } else if (!this.source.matchValue(node.source, [...keys, 'source'])) {
      return false;
    }

    return true;
  }
}

export function exportNamedDeclaration(
  declaration?: Matcher<t.Declaration> | null,
  specifiers?:
    | Matcher<
        Array<
          | t.ExportSpecifier
          | t.ExportDefaultSpecifier
          | t.ExportNamespaceSpecifier
        >
      >
    | Array<
        | Matcher<t.ExportSpecifier>
        | Matcher<t.ExportDefaultSpecifier>
        | Matcher<t.ExportNamespaceSpecifier>
      >,
  source?: Matcher<t.StringLiteral> | null
): Matcher<t.ExportNamedDeclaration> {
  return new ExportNamedDeclarationMatcher(declaration, specifiers, source);
}

export class ExportNamespaceSpecifierMatcher extends Matcher<
  t.ExportNamespaceSpecifier
> {
  constructor(private readonly exported?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportNamespaceSpecifier {
    if (!isNode(node) || !t.isExportNamespaceSpecifier(node)) {
      return false;
    }

    if (typeof this.exported === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.exported.matchValue(node.exported, [...keys, 'exported'])
    ) {
      return false;
    }

    return true;
  }
}

export function exportNamespaceSpecifier(
  exported?: Matcher<t.Identifier>
): Matcher<t.ExportNamespaceSpecifier> {
  return new ExportNamespaceSpecifierMatcher(exported);
}

export class ExportSpecifierMatcher extends Matcher<t.ExportSpecifier> {
  constructor(
    private readonly local?: Matcher<t.Identifier>,
    private readonly exported?: Matcher<t.Identifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExportSpecifier {
    if (!isNode(node) || !t.isExportSpecifier(node)) {
      return false;
    }

    if (typeof this.local === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.local.matchValue(node.local, [...keys, 'local'])) {
      return false;
    }

    if (typeof this.exported === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.exported.matchValue(node.exported, [...keys, 'exported'])
    ) {
      return false;
    }

    return true;
  }
}

export function exportSpecifier(
  local?: Matcher<t.Identifier>,
  exported?: Matcher<t.Identifier>
): Matcher<t.ExportSpecifier> {
  return new ExportSpecifierMatcher(local, exported);
}

export class ExpressionStatementMatcher extends Matcher<t.ExpressionStatement> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ExpressionStatement {
    if (!isNode(node) || !t.isExpressionStatement(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function expressionStatement(
  expression?: Matcher<t.Expression>
): Matcher<t.ExpressionStatement> {
  return new ExpressionStatementMatcher(expression);
}

export class FileMatcher extends Matcher<t.File> {
  constructor(
    private readonly program?: Matcher<t.Program>,
    private readonly comments?: Matcher<any>,
    private readonly tokens?: Matcher<any>
  ) {
    super();
  }

  matchValue(node: unknown, keys: ReadonlyArray<PropertyKey>): node is t.File {
    if (!isNode(node) || !t.isFile(node)) {
      return false;
    }

    if (typeof this.program === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.program.matchValue(node.program, [...keys, 'program'])) {
      return false;
    }

    if (typeof this.comments === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.comments.matchValue(node.comments, [...keys, 'comments'])
    ) {
      return false;
    }

    if (typeof this.tokens === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.tokens.matchValue(node.tokens, [...keys, 'tokens'])) {
      return false;
    }

    return true;
  }
}

export function file(
  program?: Matcher<t.Program>,
  comments?: Matcher<any>,
  tokens?: Matcher<any>
): Matcher<t.File> {
  return new FileMatcher(program, comments, tokens);
}

export class ForInStatementMatcher extends Matcher<t.ForInStatement> {
  constructor(
    private readonly left?: Matcher<t.VariableDeclaration | t.LVal>,
    private readonly right?: Matcher<t.Expression>,
    private readonly body?: Matcher<t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ForInStatement {
    if (!isNode(node) || !t.isForInStatement(node)) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function forInStatement(
  left?: Matcher<t.VariableDeclaration | t.LVal>,
  right?: Matcher<t.Expression>,
  body?: Matcher<t.Statement>
): Matcher<t.ForInStatement> {
  return new ForInStatementMatcher(left, right, body);
}

export class ForOfStatementMatcher extends Matcher<t.ForOfStatement> {
  constructor(
    private readonly left?: Matcher<t.VariableDeclaration | t.LVal>,
    private readonly right?: Matcher<t.Expression>,
    private readonly body?: Matcher<t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ForOfStatement {
    if (!isNode(node) || !t.isForOfStatement(node)) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function forOfStatement(
  left?: Matcher<t.VariableDeclaration | t.LVal>,
  right?: Matcher<t.Expression>,
  body?: Matcher<t.Statement>
): Matcher<t.ForOfStatement> {
  return new ForOfStatementMatcher(left, right, body);
}

export class ForStatementMatcher extends Matcher<t.ForStatement> {
  constructor(
    private readonly init?: Matcher<
      t.VariableDeclaration | t.Expression
    > | null,
    private readonly test?: Matcher<t.Expression> | null,
    private readonly update?: Matcher<t.Expression> | null,
    private readonly body?: Matcher<t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ForStatement {
    if (!isNode(node) || !t.isForStatement(node)) {
      return false;
    }

    if (typeof this.init === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.init === null) {
      // null matcher means we expect null value
      if (node.init !== null) {
        return false;
      }
    } else if (node.init === null) {
      return false;
    } else if (!this.init.matchValue(node.init, [...keys, 'init'])) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.test === null) {
      // null matcher means we expect null value
      if (node.test !== null) {
        return false;
      }
    } else if (node.test === null) {
      return false;
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.update === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.update === null) {
      // null matcher means we expect null value
      if (node.update !== null) {
        return false;
      }
    } else if (node.update === null) {
      return false;
    } else if (!this.update.matchValue(node.update, [...keys, 'update'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function forStatement(
  init?: Matcher<t.VariableDeclaration | t.Expression> | null,
  test?: Matcher<t.Expression> | null,
  update?: Matcher<t.Expression> | null,
  body?: Matcher<t.Statement>
): Matcher<t.ForStatement> {
  return new ForStatementMatcher(init, test, update, body);
}

export class FunctionDeclarationMatcher extends Matcher<t.FunctionDeclaration> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly generator?: Matcher<boolean> | boolean | null,
    private readonly async?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.FunctionDeclaration {
    if (!isNode(node) || !t.isFunctionDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.generator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.generator === 'boolean') {
      if (this.generator !== node.generator) {
        return false;
      }
    } else if (this.generator === null) {
      // null matcher means we expect null value
      if (node.generator !== null) {
        return false;
      }
    } else if (node.generator === null) {
      return false;
    } else if (
      !this.generator.matchValue(node.generator, [...keys, 'generator'])
    ) {
      return false;
    }

    if (typeof this.async === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.async === 'boolean') {
      if (this.async !== node.async) {
        return false;
      }
    } else if (this.async === null) {
      // null matcher means we expect null value
      if (node.async !== null) {
        return false;
      }
    } else if (node.async === null) {
      return false;
    } else if (!this.async.matchValue(node.async, [...keys, 'async'])) {
      return false;
    }

    return true;
  }
}

export function functionDeclaration(
  id?: Matcher<t.Identifier> | null,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement>,
  generator?: Matcher<boolean> | boolean | null,
  async?: Matcher<boolean> | boolean | null
): Matcher<t.FunctionDeclaration> {
  return new FunctionDeclarationMatcher(id, params, body, generator, async);
}

export class FunctionExpressionMatcher extends Matcher<t.FunctionExpression> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly generator?: Matcher<boolean> | boolean | null,
    private readonly async?: Matcher<boolean> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.FunctionExpression {
    if (!isNode(node) || !t.isFunctionExpression(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.generator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.generator === 'boolean') {
      if (this.generator !== node.generator) {
        return false;
      }
    } else if (this.generator === null) {
      // null matcher means we expect null value
      if (node.generator !== null) {
        return false;
      }
    } else if (node.generator === null) {
      return false;
    } else if (
      !this.generator.matchValue(node.generator, [...keys, 'generator'])
    ) {
      return false;
    }

    if (typeof this.async === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.async === 'boolean') {
      if (this.async !== node.async) {
        return false;
      }
    } else if (this.async === null) {
      // null matcher means we expect null value
      if (node.async !== null) {
        return false;
      }
    } else if (node.async === null) {
      return false;
    } else if (!this.async.matchValue(node.async, [...keys, 'async'])) {
      return false;
    }

    return true;
  }
}

export function functionExpression(
  id?: Matcher<t.Identifier> | null,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement>,
  generator?: Matcher<boolean> | boolean | null,
  async?: Matcher<boolean> | boolean | null
): Matcher<t.FunctionExpression> {
  return new FunctionExpressionMatcher(id, params, body, generator, async);
}

export class FunctionTypeAnnotationMatcher extends Matcher<
  t.FunctionTypeAnnotation
> {
  constructor(
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly params?:
      | Matcher<Array<t.FunctionTypeParam>>
      | Array<Matcher<t.FunctionTypeParam>>,
    private readonly rest?: Matcher<t.FunctionTypeParam> | null,
    private readonly returnType?: Matcher<t.FlowType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.FunctionTypeAnnotation {
    if (!isNode(node) || !t.isFunctionTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.rest === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.rest === null) {
      // null matcher means we expect null value
      if (node.rest !== null) {
        return false;
      }
    } else if (node.rest === null) {
      return false;
    } else if (!this.rest.matchValue(node.rest, [...keys, 'rest'])) {
      return false;
    }

    if (typeof this.returnType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.returnType.matchValue(node.returnType, [...keys, 'returnType'])
    ) {
      return false;
    }

    return true;
  }
}

export function functionTypeAnnotation(
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  params?:
    | Matcher<Array<t.FunctionTypeParam>>
    | Array<Matcher<t.FunctionTypeParam>>,
  rest?: Matcher<t.FunctionTypeParam> | null,
  returnType?: Matcher<t.FlowType>
): Matcher<t.FunctionTypeAnnotation> {
  return new FunctionTypeAnnotationMatcher(
    typeParameters,
    params,
    rest,
    returnType
  );
}

export class FunctionTypeParamMatcher extends Matcher<t.FunctionTypeParam> {
  constructor(
    private readonly name?: Matcher<t.Identifier> | null,
    private readonly typeAnnotation?: Matcher<t.FlowType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.FunctionTypeParam {
    if (!isNode(node) || !t.isFunctionTypeParam(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.name === null) {
      // null matcher means we expect null value
      if (node.name !== null) {
        return false;
      }
    } else if (node.name === null) {
      return false;
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function functionTypeParam(
  name?: Matcher<t.Identifier> | null,
  typeAnnotation?: Matcher<t.FlowType>
): Matcher<t.FunctionTypeParam> {
  return new FunctionTypeParamMatcher(name, typeAnnotation);
}

export class GenericTypeAnnotationMatcher extends Matcher<
  t.GenericTypeAnnotation
> {
  constructor(
    private readonly id?: Matcher<t.Identifier | t.QualifiedTypeIdentifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.GenericTypeAnnotation {
    if (!isNode(node) || !t.isGenericTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function genericTypeAnnotation(
  id?: Matcher<t.Identifier | t.QualifiedTypeIdentifier>,
  typeParameters?: Matcher<t.TypeParameterInstantiation> | null
): Matcher<t.GenericTypeAnnotation> {
  return new GenericTypeAnnotationMatcher(id, typeParameters);
}

export class IdentifierMatcher extends Matcher<t.Identifier> {
  constructor(private readonly name?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Identifier {
    if (!isNode(node) || !t.isIdentifier(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.name === 'string') {
      if (this.name !== node.name) {
        return false;
      }
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function identifier(
  name?: Matcher<string> | string
): Matcher<t.Identifier> {
  return new IdentifierMatcher(name);
}

export class IfStatementMatcher extends Matcher<t.IfStatement> {
  constructor(
    private readonly test?: Matcher<t.Expression>,
    private readonly consequent?: Matcher<t.Statement>,
    private readonly alternate?: Matcher<t.Statement> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.IfStatement {
    if (!isNode(node) || !t.isIfStatement(node)) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.consequent === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.consequent.matchValue(node.consequent, [...keys, 'consequent'])
    ) {
      return false;
    }

    if (typeof this.alternate === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.alternate === null) {
      // null matcher means we expect null value
      if (node.alternate !== null) {
        return false;
      }
    } else if (node.alternate === null) {
      return false;
    } else if (
      !this.alternate.matchValue(node.alternate, [...keys, 'alternate'])
    ) {
      return false;
    }

    return true;
  }
}

export function ifStatement(
  test?: Matcher<t.Expression>,
  consequent?: Matcher<t.Statement>,
  alternate?: Matcher<t.Statement> | null
): Matcher<t.IfStatement> {
  return new IfStatementMatcher(test, consequent, alternate);
}

export class ImportMatcher extends Matcher<t.Import> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Import {
    if (!isNode(node) || !t.isImport(node)) {
      return false;
    }

    return true;
  }
}

export function Import(): Matcher<t.Import> {
  return new ImportMatcher();
}

export class ImportDeclarationMatcher extends Matcher<t.ImportDeclaration> {
  constructor(
    private readonly specifiers?:
      | Matcher<
          Array<
            | t.ImportSpecifier
            | t.ImportDefaultSpecifier
            | t.ImportNamespaceSpecifier
          >
        >
      | Array<
          | Matcher<t.ImportSpecifier>
          | Matcher<t.ImportDefaultSpecifier>
          | Matcher<t.ImportNamespaceSpecifier>
        >,
    private readonly source?: Matcher<t.StringLiteral>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ImportDeclaration {
    if (!isNode(node) || !t.isImportDeclaration(node)) {
      return false;
    }

    if (typeof this.specifiers === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.specifiers)) {
      if (
        !tupleOf<unknown>(...this.specifiers).matchValue(node.specifiers, [
          ...keys,
          'specifiers'
        ])
      ) {
        return false;
      }
    } else if (
      !this.specifiers.matchValue(node.specifiers, [...keys, 'specifiers'])
    ) {
      return false;
    }

    if (typeof this.source === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.source.matchValue(node.source, [...keys, 'source'])) {
      return false;
    }

    return true;
  }
}

export function importDeclaration(
  specifiers?:
    | Matcher<
        Array<
          | t.ImportSpecifier
          | t.ImportDefaultSpecifier
          | t.ImportNamespaceSpecifier
        >
      >
    | Array<
        | Matcher<t.ImportSpecifier>
        | Matcher<t.ImportDefaultSpecifier>
        | Matcher<t.ImportNamespaceSpecifier>
      >,
  source?: Matcher<t.StringLiteral>
): Matcher<t.ImportDeclaration> {
  return new ImportDeclarationMatcher(specifiers, source);
}

export class ImportDefaultSpecifierMatcher extends Matcher<
  t.ImportDefaultSpecifier
> {
  constructor(private readonly local?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ImportDefaultSpecifier {
    if (!isNode(node) || !t.isImportDefaultSpecifier(node)) {
      return false;
    }

    if (typeof this.local === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.local.matchValue(node.local, [...keys, 'local'])) {
      return false;
    }

    return true;
  }
}

export function importDefaultSpecifier(
  local?: Matcher<t.Identifier>
): Matcher<t.ImportDefaultSpecifier> {
  return new ImportDefaultSpecifierMatcher(local);
}

export class ImportNamespaceSpecifierMatcher extends Matcher<
  t.ImportNamespaceSpecifier
> {
  constructor(private readonly local?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ImportNamespaceSpecifier {
    if (!isNode(node) || !t.isImportNamespaceSpecifier(node)) {
      return false;
    }

    if (typeof this.local === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.local.matchValue(node.local, [...keys, 'local'])) {
      return false;
    }

    return true;
  }
}

export function importNamespaceSpecifier(
  local?: Matcher<t.Identifier>
): Matcher<t.ImportNamespaceSpecifier> {
  return new ImportNamespaceSpecifierMatcher(local);
}

export class ImportSpecifierMatcher extends Matcher<t.ImportSpecifier> {
  constructor(
    private readonly local?: Matcher<t.Identifier>,
    private readonly imported?: Matcher<t.Identifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ImportSpecifier {
    if (!isNode(node) || !t.isImportSpecifier(node)) {
      return false;
    }

    if (typeof this.local === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.local.matchValue(node.local, [...keys, 'local'])) {
      return false;
    }

    if (typeof this.imported === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.imported.matchValue(node.imported, [...keys, 'imported'])
    ) {
      return false;
    }

    return true;
  }
}

export function importSpecifier(
  local?: Matcher<t.Identifier>,
  imported?: Matcher<t.Identifier>
): Matcher<t.ImportSpecifier> {
  return new ImportSpecifierMatcher(local, imported);
}

export class InferredPredicateMatcher extends Matcher<t.InferredPredicate> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.InferredPredicate {
    if (!isNode(node) || !t.isInferredPredicate(node)) {
      return false;
    }

    return true;
  }
}

export function inferredPredicate(): Matcher<t.InferredPredicate> {
  return new InferredPredicateMatcher();
}

export class InterfaceDeclarationMatcher extends Matcher<
  t.InterfaceDeclaration
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly _extends?:
      | Matcher<Array<t.InterfaceExtends>>
      | Array<Matcher<t.InterfaceExtends>>
      | null,
    private readonly body?: Matcher<t.ObjectTypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.InterfaceDeclaration {
    if (!isNode(node) || !t.isInterfaceDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this._extends === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._extends === null) {
      // null matcher means we expect null value
      if (node.extends !== null) {
        return false;
      }
    } else if (node.extends === null) {
      return false;
    } else if (Array.isArray(this._extends)) {
      if (
        !tupleOf<unknown>(...this._extends).matchValue(node.extends, [
          ...keys,
          'extends'
        ])
      ) {
        return false;
      }
    } else if (!this._extends.matchValue(node.extends, [...keys, 'extends'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function interfaceDeclaration(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  _extends?:
    | Matcher<Array<t.InterfaceExtends>>
    | Array<Matcher<t.InterfaceExtends>>
    | null,
  body?: Matcher<t.ObjectTypeAnnotation>
): Matcher<t.InterfaceDeclaration> {
  return new InterfaceDeclarationMatcher(id, typeParameters, _extends, body);
}

export class InterfaceExtendsMatcher extends Matcher<t.InterfaceExtends> {
  constructor(
    private readonly id?: Matcher<t.Identifier | t.QualifiedTypeIdentifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.InterfaceExtends {
    if (!isNode(node) || !t.isInterfaceExtends(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function interfaceExtends(
  id?: Matcher<t.Identifier | t.QualifiedTypeIdentifier>,
  typeParameters?: Matcher<t.TypeParameterInstantiation> | null
): Matcher<t.InterfaceExtends> {
  return new InterfaceExtendsMatcher(id, typeParameters);
}

export class InterfaceTypeAnnotationMatcher extends Matcher<
  t.InterfaceTypeAnnotation
> {
  constructor(
    private readonly _extends?:
      | Matcher<Array<t.InterfaceExtends>>
      | Array<Matcher<t.InterfaceExtends>>
      | null,
    private readonly body?: Matcher<t.ObjectTypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.InterfaceTypeAnnotation {
    if (!isNode(node) || !t.isInterfaceTypeAnnotation(node)) {
      return false;
    }

    if (typeof this._extends === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._extends === null) {
      // null matcher means we expect null value
      if (node.extends !== null) {
        return false;
      }
    } else if (node.extends === null) {
      return false;
    } else if (Array.isArray(this._extends)) {
      if (
        !tupleOf<unknown>(...this._extends).matchValue(node.extends, [
          ...keys,
          'extends'
        ])
      ) {
        return false;
      }
    } else if (!this._extends.matchValue(node.extends, [...keys, 'extends'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function interfaceTypeAnnotation(
  _extends?:
    | Matcher<Array<t.InterfaceExtends>>
    | Array<Matcher<t.InterfaceExtends>>
    | null,
  body?: Matcher<t.ObjectTypeAnnotation>
): Matcher<t.InterfaceTypeAnnotation> {
  return new InterfaceTypeAnnotationMatcher(_extends, body);
}

export class InterpreterDirectiveMatcher extends Matcher<
  t.InterpreterDirective
> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.InterpreterDirective {
    if (!isNode(node) || !t.isInterpreterDirective(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function interpreterDirective(
  value?: Matcher<string> | string
): Matcher<t.InterpreterDirective> {
  return new InterpreterDirectiveMatcher(value);
}

export class IntersectionTypeAnnotationMatcher extends Matcher<
  t.IntersectionTypeAnnotation
> {
  constructor(
    private readonly types?:
      | Matcher<Array<t.FlowType>>
      | Array<Matcher<t.FlowType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.IntersectionTypeAnnotation {
    if (!isNode(node) || !t.isIntersectionTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.types === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.types)) {
      if (
        !tupleOf<unknown>(...this.types).matchValue(node.types, [
          ...keys,
          'types'
        ])
      ) {
        return false;
      }
    } else if (!this.types.matchValue(node.types, [...keys, 'types'])) {
      return false;
    }

    return true;
  }
}

export function intersectionTypeAnnotation(
  types?: Matcher<Array<t.FlowType>> | Array<Matcher<t.FlowType>>
): Matcher<t.IntersectionTypeAnnotation> {
  return new IntersectionTypeAnnotationMatcher(types);
}

export class JSXAttributeMatcher extends Matcher<t.JSXAttribute> {
  constructor(
    private readonly name?: Matcher<t.JSXIdentifier | t.JSXNamespacedName>,
    private readonly value?: Matcher<
      t.JSXElement | t.JSXFragment | t.StringLiteral | t.JSXExpressionContainer
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXAttribute {
    if (!isNode(node) || !t.isJSXAttribute(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.value === null) {
      // null matcher means we expect null value
      if (node.value !== null) {
        return false;
      }
    } else if (node.value === null) {
      return false;
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function jsxAttribute(
  name?: Matcher<t.JSXIdentifier | t.JSXNamespacedName>,
  value?: Matcher<
    t.JSXElement | t.JSXFragment | t.StringLiteral | t.JSXExpressionContainer
  > | null
): Matcher<t.JSXAttribute> {
  return new JSXAttributeMatcher(name, value);
}

export class JSXClosingElementMatcher extends Matcher<t.JSXClosingElement> {
  constructor(
    private readonly name?: Matcher<
      t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
    >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXClosingElement {
    if (!isNode(node) || !t.isJSXClosingElement(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function jsxClosingElement(
  name?: Matcher<t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName>
): Matcher<t.JSXClosingElement> {
  return new JSXClosingElementMatcher(name);
}

export class JSXClosingFragmentMatcher extends Matcher<t.JSXClosingFragment> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXClosingFragment {
    if (!isNode(node) || !t.isJSXClosingFragment(node)) {
      return false;
    }

    return true;
  }
}

export function jsxClosingFragment(): Matcher<t.JSXClosingFragment> {
  return new JSXClosingFragmentMatcher();
}

export class JSXElementMatcher extends Matcher<t.JSXElement> {
  constructor(
    private readonly openingElement?: Matcher<t.JSXOpeningElement>,
    private readonly closingElement?: Matcher<t.JSXClosingElement> | null,
    private readonly children?:
      | Matcher<
          Array<
            | t.JSXText
            | t.JSXExpressionContainer
            | t.JSXSpreadChild
            | t.JSXElement
            | t.JSXFragment
          >
        >
      | Array<
          | Matcher<t.JSXText>
          | Matcher<t.JSXExpressionContainer>
          | Matcher<t.JSXSpreadChild>
          | Matcher<t.JSXElement>
          | Matcher<t.JSXFragment>
        >,
    private readonly selfClosing?: Matcher<any>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXElement {
    if (!isNode(node) || !t.isJSXElement(node)) {
      return false;
    }

    if (typeof this.openingElement === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.openingElement.matchValue(node.openingElement, [
        ...keys,
        'openingElement'
      ])
    ) {
      return false;
    }

    if (typeof this.closingElement === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.closingElement === null) {
      // null matcher means we expect null value
      if (node.closingElement !== null) {
        return false;
      }
    } else if (node.closingElement === null) {
      return false;
    } else if (
      !this.closingElement.matchValue(node.closingElement, [
        ...keys,
        'closingElement'
      ])
    ) {
      return false;
    }

    if (typeof this.children === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.children)) {
      if (
        !tupleOf<unknown>(...this.children).matchValue(node.children, [
          ...keys,
          'children'
        ])
      ) {
        return false;
      }
    } else if (
      !this.children.matchValue(node.children, [...keys, 'children'])
    ) {
      return false;
    }

    if (typeof this.selfClosing === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.selfClosing.matchValue(node.selfClosing, [...keys, 'selfClosing'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxElement(
  openingElement?: Matcher<t.JSXOpeningElement>,
  closingElement?: Matcher<t.JSXClosingElement> | null,
  children?:
    | Matcher<
        Array<
          | t.JSXText
          | t.JSXExpressionContainer
          | t.JSXSpreadChild
          | t.JSXElement
          | t.JSXFragment
        >
      >
    | Array<
        | Matcher<t.JSXText>
        | Matcher<t.JSXExpressionContainer>
        | Matcher<t.JSXSpreadChild>
        | Matcher<t.JSXElement>
        | Matcher<t.JSXFragment>
      >,
  selfClosing?: Matcher<any>
): Matcher<t.JSXElement> {
  return new JSXElementMatcher(
    openingElement,
    closingElement,
    children,
    selfClosing
  );
}

export class JSXEmptyExpressionMatcher extends Matcher<t.JSXEmptyExpression> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXEmptyExpression {
    if (!isNode(node) || !t.isJSXEmptyExpression(node)) {
      return false;
    }

    return true;
  }
}

export function jsxEmptyExpression(): Matcher<t.JSXEmptyExpression> {
  return new JSXEmptyExpressionMatcher();
}

export class JSXExpressionContainerMatcher extends Matcher<
  t.JSXExpressionContainer
> {
  constructor(
    private readonly expression?: Matcher<t.Expression | t.JSXEmptyExpression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXExpressionContainer {
    if (!isNode(node) || !t.isJSXExpressionContainer(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxExpressionContainer(
  expression?: Matcher<t.Expression | t.JSXEmptyExpression>
): Matcher<t.JSXExpressionContainer> {
  return new JSXExpressionContainerMatcher(expression);
}

export class JSXFragmentMatcher extends Matcher<t.JSXFragment> {
  constructor(
    private readonly openingFragment?: Matcher<t.JSXOpeningFragment>,
    private readonly closingFragment?: Matcher<t.JSXClosingFragment>,
    private readonly children?:
      | Matcher<
          Array<
            | t.JSXText
            | t.JSXExpressionContainer
            | t.JSXSpreadChild
            | t.JSXElement
            | t.JSXFragment
          >
        >
      | Array<
          | Matcher<t.JSXText>
          | Matcher<t.JSXExpressionContainer>
          | Matcher<t.JSXSpreadChild>
          | Matcher<t.JSXElement>
          | Matcher<t.JSXFragment>
        >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXFragment {
    if (!isNode(node) || !t.isJSXFragment(node)) {
      return false;
    }

    if (typeof this.openingFragment === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.openingFragment.matchValue(node.openingFragment, [
        ...keys,
        'openingFragment'
      ])
    ) {
      return false;
    }

    if (typeof this.closingFragment === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.closingFragment.matchValue(node.closingFragment, [
        ...keys,
        'closingFragment'
      ])
    ) {
      return false;
    }

    if (typeof this.children === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.children)) {
      if (
        !tupleOf<unknown>(...this.children).matchValue(node.children, [
          ...keys,
          'children'
        ])
      ) {
        return false;
      }
    } else if (
      !this.children.matchValue(node.children, [...keys, 'children'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxFragment(
  openingFragment?: Matcher<t.JSXOpeningFragment>,
  closingFragment?: Matcher<t.JSXClosingFragment>,
  children?:
    | Matcher<
        Array<
          | t.JSXText
          | t.JSXExpressionContainer
          | t.JSXSpreadChild
          | t.JSXElement
          | t.JSXFragment
        >
      >
    | Array<
        | Matcher<t.JSXText>
        | Matcher<t.JSXExpressionContainer>
        | Matcher<t.JSXSpreadChild>
        | Matcher<t.JSXElement>
        | Matcher<t.JSXFragment>
      >
): Matcher<t.JSXFragment> {
  return new JSXFragmentMatcher(openingFragment, closingFragment, children);
}

export class JSXIdentifierMatcher extends Matcher<t.JSXIdentifier> {
  constructor(private readonly name?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXIdentifier {
    if (!isNode(node) || !t.isJSXIdentifier(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.name === 'string') {
      if (this.name !== node.name) {
        return false;
      }
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function jsxIdentifier(
  name?: Matcher<string> | string
): Matcher<t.JSXIdentifier> {
  return new JSXIdentifierMatcher(name);
}

export class JSXMemberExpressionMatcher extends Matcher<t.JSXMemberExpression> {
  constructor(
    private readonly object?: Matcher<t.JSXMemberExpression | t.JSXIdentifier>,
    private readonly property?: Matcher<t.JSXIdentifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXMemberExpression {
    if (!isNode(node) || !t.isJSXMemberExpression(node)) {
      return false;
    }

    if (typeof this.object === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.object.matchValue(node.object, [...keys, 'object'])) {
      return false;
    }

    if (typeof this.property === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.property.matchValue(node.property, [...keys, 'property'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxMemberExpression(
  object?: Matcher<t.JSXMemberExpression | t.JSXIdentifier>,
  property?: Matcher<t.JSXIdentifier>
): Matcher<t.JSXMemberExpression> {
  return new JSXMemberExpressionMatcher(object, property);
}

export class JSXNamespacedNameMatcher extends Matcher<t.JSXNamespacedName> {
  constructor(
    private readonly namespace?: Matcher<t.JSXIdentifier>,
    private readonly name?: Matcher<t.JSXIdentifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXNamespacedName {
    if (!isNode(node) || !t.isJSXNamespacedName(node)) {
      return false;
    }

    if (typeof this.namespace === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.namespace.matchValue(node.namespace, [...keys, 'namespace'])
    ) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function jsxNamespacedName(
  namespace?: Matcher<t.JSXIdentifier>,
  name?: Matcher<t.JSXIdentifier>
): Matcher<t.JSXNamespacedName> {
  return new JSXNamespacedNameMatcher(namespace, name);
}

export class JSXOpeningElementMatcher extends Matcher<t.JSXOpeningElement> {
  constructor(
    private readonly name?: Matcher<
      t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
    >,
    private readonly attributes?:
      | Matcher<Array<t.JSXAttribute | t.JSXSpreadAttribute>>
      | Array<Matcher<t.JSXAttribute> | Matcher<t.JSXSpreadAttribute>>,
    private readonly selfClosing?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXOpeningElement {
    if (!isNode(node) || !t.isJSXOpeningElement(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    if (typeof this.attributes === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.attributes)) {
      if (
        !tupleOf<unknown>(...this.attributes).matchValue(node.attributes, [
          ...keys,
          'attributes'
        ])
      ) {
        return false;
      }
    } else if (
      !this.attributes.matchValue(node.attributes, [...keys, 'attributes'])
    ) {
      return false;
    }

    if (typeof this.selfClosing === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.selfClosing === 'boolean') {
      if (this.selfClosing !== node.selfClosing) {
        return false;
      }
    } else if (
      !this.selfClosing.matchValue(node.selfClosing, [...keys, 'selfClosing'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxOpeningElement(
  name?: Matcher<t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName>,
  attributes?:
    | Matcher<Array<t.JSXAttribute | t.JSXSpreadAttribute>>
    | Array<Matcher<t.JSXAttribute> | Matcher<t.JSXSpreadAttribute>>,
  selfClosing?: Matcher<boolean> | boolean
): Matcher<t.JSXOpeningElement> {
  return new JSXOpeningElementMatcher(name, attributes, selfClosing);
}

export class JSXOpeningFragmentMatcher extends Matcher<t.JSXOpeningFragment> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXOpeningFragment {
    if (!isNode(node) || !t.isJSXOpeningFragment(node)) {
      return false;
    }

    return true;
  }
}

export function jsxOpeningFragment(): Matcher<t.JSXOpeningFragment> {
  return new JSXOpeningFragmentMatcher();
}

export class JSXSpreadAttributeMatcher extends Matcher<t.JSXSpreadAttribute> {
  constructor(private readonly argument?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXSpreadAttribute {
    if (!isNode(node) || !t.isJSXSpreadAttribute(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxSpreadAttribute(
  argument?: Matcher<t.Expression>
): Matcher<t.JSXSpreadAttribute> {
  return new JSXSpreadAttributeMatcher(argument);
}

export class JSXSpreadChildMatcher extends Matcher<t.JSXSpreadChild> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXSpreadChild {
    if (!isNode(node) || !t.isJSXSpreadChild(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function jsxSpreadChild(
  expression?: Matcher<t.Expression>
): Matcher<t.JSXSpreadChild> {
  return new JSXSpreadChildMatcher(expression);
}

export class JSXTextMatcher extends Matcher<t.JSXText> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.JSXText {
    if (!isNode(node) || !t.isJSXText(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function jsxText(value?: Matcher<string> | string): Matcher<t.JSXText> {
  return new JSXTextMatcher(value);
}

export class LabeledStatementMatcher extends Matcher<t.LabeledStatement> {
  constructor(
    private readonly label?: Matcher<t.Identifier>,
    private readonly body?: Matcher<t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.LabeledStatement {
    if (!isNode(node) || !t.isLabeledStatement(node)) {
      return false;
    }

    if (typeof this.label === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.label.matchValue(node.label, [...keys, 'label'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function labeledStatement(
  label?: Matcher<t.Identifier>,
  body?: Matcher<t.Statement>
): Matcher<t.LabeledStatement> {
  return new LabeledStatementMatcher(label, body);
}

export class LogicalExpressionMatcher extends Matcher<t.LogicalExpression> {
  constructor(
    private readonly operator?: Matcher<'||' | '&&' | '??'> | string,
    private readonly left?: Matcher<t.Expression>,
    private readonly right?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.LogicalExpression {
    if (!isNode(node) || !t.isLogicalExpression(node)) {
      return false;
    }

    if (typeof this.operator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.operator === 'string') {
      if (this.operator !== node.operator) {
        return false;
      }
    } else if (
      !this.operator.matchValue(node.operator, [...keys, 'operator'])
    ) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function logicalExpression(
  operator?: Matcher<'||' | '&&' | '??'> | string,
  left?: Matcher<t.Expression>,
  right?: Matcher<t.Expression>
): Matcher<t.LogicalExpression> {
  return new LogicalExpressionMatcher(operator, left, right);
}

export class MemberExpressionMatcher extends Matcher<t.MemberExpression> {
  constructor(
    private readonly object?: Matcher<t.Expression>,
    private readonly property?: Matcher<any>,
    private readonly computed?: Matcher<boolean> | boolean,
    private readonly optional?: Matcher<true | false> | boolean | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.MemberExpression {
    if (!isNode(node) || !t.isMemberExpression(node)) {
      return false;
    }

    if (typeof this.object === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.object.matchValue(node.object, [...keys, 'object'])) {
      return false;
    }

    if (typeof this.property === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.property.matchValue(node.property, [...keys, 'property'])
    ) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    if (typeof this.optional === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.optional === 'boolean') {
      if (this.optional !== node.optional) {
        return false;
      }
    } else if (this.optional === null) {
      // null matcher means we expect null value
      if (node.optional !== null) {
        return false;
      }
    } else if (node.optional === null) {
      return false;
    } else if (
      !this.optional.matchValue(node.optional, [...keys, 'optional'])
    ) {
      return false;
    }

    return true;
  }
}

export function memberExpression(
  object?: Matcher<t.Expression>,
  property?: Matcher<any>,
  computed?: Matcher<boolean> | boolean,
  optional?: Matcher<true | false> | boolean | null
): Matcher<t.MemberExpression> {
  return new MemberExpressionMatcher(object, property, computed, optional);
}

export class MetaPropertyMatcher extends Matcher<t.MetaProperty> {
  constructor(
    private readonly meta?: Matcher<t.Identifier>,
    private readonly property?: Matcher<t.Identifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.MetaProperty {
    if (!isNode(node) || !t.isMetaProperty(node)) {
      return false;
    }

    if (typeof this.meta === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.meta.matchValue(node.meta, [...keys, 'meta'])) {
      return false;
    }

    if (typeof this.property === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.property.matchValue(node.property, [...keys, 'property'])
    ) {
      return false;
    }

    return true;
  }
}

export function metaProperty(
  meta?: Matcher<t.Identifier>,
  property?: Matcher<t.Identifier>
): Matcher<t.MetaProperty> {
  return new MetaPropertyMatcher(meta, property);
}

export class MixedTypeAnnotationMatcher extends Matcher<t.MixedTypeAnnotation> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.MixedTypeAnnotation {
    if (!isNode(node) || !t.isMixedTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function mixedTypeAnnotation(): Matcher<t.MixedTypeAnnotation> {
  return new MixedTypeAnnotationMatcher();
}

export class NewExpressionMatcher extends Matcher<t.NewExpression> {
  constructor(
    private readonly callee?: Matcher<t.Expression | t.V8IntrinsicIdentifier>,
    private readonly _arguments?:
      | Matcher<
          Array<
            | t.Expression
            | t.SpreadElement
            | t.JSXNamespacedName
            | t.ArgumentPlaceholder
          >
        >
      | Array<
          | Matcher<t.Expression>
          | Matcher<t.SpreadElement>
          | Matcher<t.JSXNamespacedName>
          | Matcher<t.ArgumentPlaceholder>
        >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NewExpression {
    if (!isNode(node) || !t.isNewExpression(node)) {
      return false;
    }

    if (typeof this.callee === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.callee.matchValue(node.callee, [...keys, 'callee'])) {
      return false;
    }

    if (typeof this._arguments === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this._arguments)) {
      if (
        !tupleOf<unknown>(...this._arguments).matchValue(node.arguments, [
          ...keys,
          'arguments'
        ])
      ) {
        return false;
      }
    } else if (
      !this._arguments.matchValue(node.arguments, [...keys, 'arguments'])
    ) {
      return false;
    }

    return true;
  }
}

export function newExpression(
  callee?: Matcher<t.Expression | t.V8IntrinsicIdentifier>,
  _arguments?:
    | Matcher<
        Array<
          | t.Expression
          | t.SpreadElement
          | t.JSXNamespacedName
          | t.ArgumentPlaceholder
        >
      >
    | Array<
        | Matcher<t.Expression>
        | Matcher<t.SpreadElement>
        | Matcher<t.JSXNamespacedName>
        | Matcher<t.ArgumentPlaceholder>
      >
): Matcher<t.NewExpression> {
  return new NewExpressionMatcher(callee, _arguments);
}

export class NoopMatcher extends Matcher<t.Noop> {
  constructor() {
    super();
  }

  matchValue(node: unknown, keys: ReadonlyArray<PropertyKey>): node is t.Noop {
    if (!isNode(node) || !t.isNoop(node)) {
      return false;
    }

    return true;
  }
}

export function noop(): Matcher<t.Noop> {
  return new NoopMatcher();
}

export class NullLiteralMatcher extends Matcher<t.NullLiteral> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NullLiteral {
    if (!isNode(node) || !t.isNullLiteral(node)) {
      return false;
    }

    return true;
  }
}

export function nullLiteral(): Matcher<t.NullLiteral> {
  return new NullLiteralMatcher();
}

export class NullLiteralTypeAnnotationMatcher extends Matcher<
  t.NullLiteralTypeAnnotation
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NullLiteralTypeAnnotation {
    if (!isNode(node) || !t.isNullLiteralTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function nullLiteralTypeAnnotation(): Matcher<
  t.NullLiteralTypeAnnotation
> {
  return new NullLiteralTypeAnnotationMatcher();
}

export class NullableTypeAnnotationMatcher extends Matcher<
  t.NullableTypeAnnotation
> {
  constructor(private readonly typeAnnotation?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NullableTypeAnnotation {
    if (!isNode(node) || !t.isNullableTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function nullableTypeAnnotation(
  typeAnnotation?: Matcher<t.FlowType>
): Matcher<t.NullableTypeAnnotation> {
  return new NullableTypeAnnotationMatcher(typeAnnotation);
}

export class NumberLiteralTypeAnnotationMatcher extends Matcher<
  t.NumberLiteralTypeAnnotation
> {
  constructor(private readonly value?: Matcher<number> | number) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NumberLiteralTypeAnnotation {
    if (!isNode(node) || !t.isNumberLiteralTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'number') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function numberLiteralTypeAnnotation(
  value?: Matcher<number> | number
): Matcher<t.NumberLiteralTypeAnnotation> {
  return new NumberLiteralTypeAnnotationMatcher(value);
}

export class NumberTypeAnnotationMatcher extends Matcher<
  t.NumberTypeAnnotation
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NumberTypeAnnotation {
    if (!isNode(node) || !t.isNumberTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function numberTypeAnnotation(): Matcher<t.NumberTypeAnnotation> {
  return new NumberTypeAnnotationMatcher();
}

export class NumericLiteralMatcher extends Matcher<t.NumericLiteral> {
  constructor(private readonly value?: Matcher<number> | number) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.NumericLiteral {
    if (!isNode(node) || !t.isNumericLiteral(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'number') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function numericLiteral(
  value?: Matcher<number> | number
): Matcher<t.NumericLiteral> {
  return new NumericLiteralMatcher(value);
}

export class ObjectExpressionMatcher extends Matcher<t.ObjectExpression> {
  constructor(
    private readonly properties?:
      | Matcher<Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>>
      | Array<
          | Matcher<t.ObjectMethod>
          | Matcher<t.ObjectProperty>
          | Matcher<t.SpreadElement>
        >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectExpression {
    if (!isNode(node) || !t.isObjectExpression(node)) {
      return false;
    }

    if (typeof this.properties === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.properties)) {
      if (
        !tupleOf<unknown>(...this.properties).matchValue(node.properties, [
          ...keys,
          'properties'
        ])
      ) {
        return false;
      }
    } else if (
      !this.properties.matchValue(node.properties, [...keys, 'properties'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectExpression(
  properties?:
    | Matcher<Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>>
    | Array<
        | Matcher<t.ObjectMethod>
        | Matcher<t.ObjectProperty>
        | Matcher<t.SpreadElement>
      >
): Matcher<t.ObjectExpression> {
  return new ObjectExpressionMatcher(properties);
}

export class ObjectMethodMatcher extends Matcher<t.ObjectMethod> {
  constructor(
    private readonly kind?: Matcher<'method' | 'get' | 'set'> | string,
    private readonly key?: Matcher<any>,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly body?: Matcher<t.BlockStatement>,
    private readonly computed?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectMethod {
    if (!isNode(node) || !t.isObjectMethod(node)) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectMethod(
  kind?: Matcher<'method' | 'get' | 'set'> | string,
  key?: Matcher<any>,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  body?: Matcher<t.BlockStatement>,
  computed?: Matcher<boolean> | boolean
): Matcher<t.ObjectMethod> {
  return new ObjectMethodMatcher(kind, key, params, body, computed);
}

export class ObjectPatternMatcher extends Matcher<t.ObjectPattern> {
  constructor(
    private readonly properties?:
      | Matcher<Array<t.RestElement | t.ObjectProperty>>
      | Array<Matcher<t.RestElement> | Matcher<t.ObjectProperty>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectPattern {
    if (!isNode(node) || !t.isObjectPattern(node)) {
      return false;
    }

    if (typeof this.properties === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.properties)) {
      if (
        !tupleOf<unknown>(...this.properties).matchValue(node.properties, [
          ...keys,
          'properties'
        ])
      ) {
        return false;
      }
    } else if (
      !this.properties.matchValue(node.properties, [...keys, 'properties'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectPattern(
  properties?:
    | Matcher<Array<t.RestElement | t.ObjectProperty>>
    | Array<Matcher<t.RestElement> | Matcher<t.ObjectProperty>>
): Matcher<t.ObjectPattern> {
  return new ObjectPatternMatcher(properties);
}

export class ObjectPropertyMatcher extends Matcher<t.ObjectProperty> {
  constructor(
    private readonly key?: Matcher<any>,
    private readonly value?: Matcher<t.Expression | t.PatternLike>,
    private readonly computed?: Matcher<boolean> | boolean,
    private readonly shorthand?: Matcher<boolean> | boolean,
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectProperty {
    if (!isNode(node) || !t.isObjectProperty(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    if (typeof this.shorthand === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.shorthand === 'boolean') {
      if (this.shorthand !== node.shorthand) {
        return false;
      }
    } else if (
      !this.shorthand.matchValue(node.shorthand, [...keys, 'shorthand'])
    ) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectProperty(
  key?: Matcher<any>,
  value?: Matcher<t.Expression | t.PatternLike>,
  computed?: Matcher<boolean> | boolean,
  shorthand?: Matcher<boolean> | boolean,
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null
): Matcher<t.ObjectProperty> {
  return new ObjectPropertyMatcher(key, value, computed, shorthand, decorators);
}

export class ObjectTypeAnnotationMatcher extends Matcher<
  t.ObjectTypeAnnotation
> {
  constructor(
    private readonly properties?:
      | Matcher<Array<t.ObjectTypeProperty | t.ObjectTypeSpreadProperty>>
      | Array<
          Matcher<t.ObjectTypeProperty> | Matcher<t.ObjectTypeSpreadProperty>
        >,
    private readonly indexers?:
      | Matcher<Array<t.ObjectTypeIndexer>>
      | Array<Matcher<t.ObjectTypeIndexer>>
      | null,
    private readonly callProperties?:
      | Matcher<Array<t.ObjectTypeCallProperty>>
      | Array<Matcher<t.ObjectTypeCallProperty>>
      | null,
    private readonly internalSlots?:
      | Matcher<Array<t.ObjectTypeInternalSlot>>
      | Array<Matcher<t.ObjectTypeInternalSlot>>
      | null,
    private readonly exact?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeAnnotation {
    if (!isNode(node) || !t.isObjectTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.properties === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.properties)) {
      if (
        !tupleOf<unknown>(...this.properties).matchValue(node.properties, [
          ...keys,
          'properties'
        ])
      ) {
        return false;
      }
    } else if (
      !this.properties.matchValue(node.properties, [...keys, 'properties'])
    ) {
      return false;
    }

    if (typeof this.indexers === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.indexers === null) {
      // null matcher means we expect null value
      if (node.indexers !== null) {
        return false;
      }
    } else if (node.indexers === null) {
      return false;
    } else if (Array.isArray(this.indexers)) {
      if (
        !tupleOf<unknown>(...this.indexers).matchValue(node.indexers, [
          ...keys,
          'indexers'
        ])
      ) {
        return false;
      }
    } else if (
      !this.indexers.matchValue(node.indexers, [...keys, 'indexers'])
    ) {
      return false;
    }

    if (typeof this.callProperties === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.callProperties === null) {
      // null matcher means we expect null value
      if (node.callProperties !== null) {
        return false;
      }
    } else if (node.callProperties === null) {
      return false;
    } else if (Array.isArray(this.callProperties)) {
      if (
        !tupleOf<unknown>(...this.callProperties).matchValue(
          node.callProperties,
          [...keys, 'callProperties']
        )
      ) {
        return false;
      }
    } else if (
      !this.callProperties.matchValue(node.callProperties, [
        ...keys,
        'callProperties'
      ])
    ) {
      return false;
    }

    if (typeof this.internalSlots === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.internalSlots === null) {
      // null matcher means we expect null value
      if (node.internalSlots !== null) {
        return false;
      }
    } else if (node.internalSlots === null) {
      return false;
    } else if (Array.isArray(this.internalSlots)) {
      if (
        !tupleOf<unknown>(...this.internalSlots).matchValue(
          node.internalSlots,
          [...keys, 'internalSlots']
        )
      ) {
        return false;
      }
    } else if (
      !this.internalSlots.matchValue(node.internalSlots, [
        ...keys,
        'internalSlots'
      ])
    ) {
      return false;
    }

    if (typeof this.exact === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.exact === 'boolean') {
      if (this.exact !== node.exact) {
        return false;
      }
    } else if (!this.exact.matchValue(node.exact, [...keys, 'exact'])) {
      return false;
    }

    return true;
  }
}

export function objectTypeAnnotation(
  properties?:
    | Matcher<Array<t.ObjectTypeProperty | t.ObjectTypeSpreadProperty>>
    | Array<
        Matcher<t.ObjectTypeProperty> | Matcher<t.ObjectTypeSpreadProperty>
      >,
  indexers?:
    | Matcher<Array<t.ObjectTypeIndexer>>
    | Array<Matcher<t.ObjectTypeIndexer>>
    | null,
  callProperties?:
    | Matcher<Array<t.ObjectTypeCallProperty>>
    | Array<Matcher<t.ObjectTypeCallProperty>>
    | null,
  internalSlots?:
    | Matcher<Array<t.ObjectTypeInternalSlot>>
    | Array<Matcher<t.ObjectTypeInternalSlot>>
    | null,
  exact?: Matcher<boolean> | boolean
): Matcher<t.ObjectTypeAnnotation> {
  return new ObjectTypeAnnotationMatcher(
    properties,
    indexers,
    callProperties,
    internalSlots,
    exact
  );
}

export class ObjectTypeCallPropertyMatcher extends Matcher<
  t.ObjectTypeCallProperty
> {
  constructor(private readonly value?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeCallProperty {
    if (!isNode(node) || !t.isObjectTypeCallProperty(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function objectTypeCallProperty(
  value?: Matcher<t.FlowType>
): Matcher<t.ObjectTypeCallProperty> {
  return new ObjectTypeCallPropertyMatcher(value);
}

export class ObjectTypeIndexerMatcher extends Matcher<t.ObjectTypeIndexer> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly key?: Matcher<t.FlowType>,
    private readonly value?: Matcher<t.FlowType>,
    private readonly variance?: Matcher<t.Variance> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeIndexer {
    if (!isNode(node) || !t.isObjectTypeIndexer(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.variance === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.variance === null) {
      // null matcher means we expect null value
      if (node.variance !== null) {
        return false;
      }
    } else if (node.variance === null) {
      return false;
    } else if (
      !this.variance.matchValue(node.variance, [...keys, 'variance'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectTypeIndexer(
  id?: Matcher<t.Identifier> | null,
  key?: Matcher<t.FlowType>,
  value?: Matcher<t.FlowType>,
  variance?: Matcher<t.Variance> | null
): Matcher<t.ObjectTypeIndexer> {
  return new ObjectTypeIndexerMatcher(id, key, value, variance);
}

export class ObjectTypeInternalSlotMatcher extends Matcher<
  t.ObjectTypeInternalSlot
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly value?: Matcher<t.FlowType>,
    private readonly optional?: Matcher<boolean> | boolean,
    private readonly _static?: Matcher<boolean> | boolean,
    private readonly method?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeInternalSlot {
    if (!isNode(node) || !t.isObjectTypeInternalSlot(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.optional === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.optional === 'boolean') {
      if (this.optional !== node.optional) {
        return false;
      }
    } else if (
      !this.optional.matchValue(node.optional, [...keys, 'optional'])
    ) {
      return false;
    }

    if (typeof this._static === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this._static === 'boolean') {
      if (this._static !== node.static) {
        return false;
      }
    } else if (!this._static.matchValue(node.static, [...keys, 'static'])) {
      return false;
    }

    if (typeof this.method === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.method === 'boolean') {
      if (this.method !== node.method) {
        return false;
      }
    } else if (!this.method.matchValue(node.method, [...keys, 'method'])) {
      return false;
    }

    return true;
  }
}

export function objectTypeInternalSlot(
  id?: Matcher<t.Identifier>,
  value?: Matcher<t.FlowType>,
  optional?: Matcher<boolean> | boolean,
  _static?: Matcher<boolean> | boolean,
  method?: Matcher<boolean> | boolean
): Matcher<t.ObjectTypeInternalSlot> {
  return new ObjectTypeInternalSlotMatcher(
    id,
    value,
    optional,
    _static,
    method
  );
}

export class ObjectTypePropertyMatcher extends Matcher<t.ObjectTypeProperty> {
  constructor(
    private readonly key?: Matcher<t.Identifier | t.StringLiteral>,
    private readonly value?: Matcher<t.FlowType>,
    private readonly variance?: Matcher<t.Variance> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeProperty {
    if (!isNode(node) || !t.isObjectTypeProperty(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.variance === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.variance === null) {
      // null matcher means we expect null value
      if (node.variance !== null) {
        return false;
      }
    } else if (node.variance === null) {
      return false;
    } else if (
      !this.variance.matchValue(node.variance, [...keys, 'variance'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectTypeProperty(
  key?: Matcher<t.Identifier | t.StringLiteral>,
  value?: Matcher<t.FlowType>,
  variance?: Matcher<t.Variance> | null
): Matcher<t.ObjectTypeProperty> {
  return new ObjectTypePropertyMatcher(key, value, variance);
}

export class ObjectTypeSpreadPropertyMatcher extends Matcher<
  t.ObjectTypeSpreadProperty
> {
  constructor(private readonly argument?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ObjectTypeSpreadProperty {
    if (!isNode(node) || !t.isObjectTypeSpreadProperty(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function objectTypeSpreadProperty(
  argument?: Matcher<t.FlowType>
): Matcher<t.ObjectTypeSpreadProperty> {
  return new ObjectTypeSpreadPropertyMatcher(argument);
}

export class OpaqueTypeMatcher extends Matcher<t.OpaqueType> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly supertype?: Matcher<t.FlowType> | null,
    private readonly impltype?: Matcher<t.FlowType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.OpaqueType {
    if (!isNode(node) || !t.isOpaqueType(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.supertype === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.supertype === null) {
      // null matcher means we expect null value
      if (node.supertype !== null) {
        return false;
      }
    } else if (node.supertype === null) {
      return false;
    } else if (
      !this.supertype.matchValue(node.supertype, [...keys, 'supertype'])
    ) {
      return false;
    }

    if (typeof this.impltype === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.impltype.matchValue(node.impltype, [...keys, 'impltype'])
    ) {
      return false;
    }

    return true;
  }
}

export function opaqueType(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  supertype?: Matcher<t.FlowType> | null,
  impltype?: Matcher<t.FlowType>
): Matcher<t.OpaqueType> {
  return new OpaqueTypeMatcher(id, typeParameters, supertype, impltype);
}

export class OptionalCallExpressionMatcher extends Matcher<
  t.OptionalCallExpression
> {
  constructor(
    private readonly callee?: Matcher<t.Expression>,
    private readonly _arguments?:
      | Matcher<Array<t.Expression | t.SpreadElement | t.JSXNamespacedName>>
      | Array<
          | Matcher<t.Expression>
          | Matcher<t.SpreadElement>
          | Matcher<t.JSXNamespacedName>
        >,
    private readonly optional?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.OptionalCallExpression {
    if (!isNode(node) || !t.isOptionalCallExpression(node)) {
      return false;
    }

    if (typeof this.callee === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.callee.matchValue(node.callee, [...keys, 'callee'])) {
      return false;
    }

    if (typeof this._arguments === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this._arguments)) {
      if (
        !tupleOf<unknown>(...this._arguments).matchValue(node.arguments, [
          ...keys,
          'arguments'
        ])
      ) {
        return false;
      }
    } else if (
      !this._arguments.matchValue(node.arguments, [...keys, 'arguments'])
    ) {
      return false;
    }

    if (typeof this.optional === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.optional === 'boolean') {
      if (this.optional !== node.optional) {
        return false;
      }
    } else if (
      !this.optional.matchValue(node.optional, [...keys, 'optional'])
    ) {
      return false;
    }

    return true;
  }
}

export function optionalCallExpression(
  callee?: Matcher<t.Expression>,
  _arguments?:
    | Matcher<Array<t.Expression | t.SpreadElement | t.JSXNamespacedName>>
    | Array<
        | Matcher<t.Expression>
        | Matcher<t.SpreadElement>
        | Matcher<t.JSXNamespacedName>
      >,
  optional?: Matcher<boolean> | boolean
): Matcher<t.OptionalCallExpression> {
  return new OptionalCallExpressionMatcher(callee, _arguments, optional);
}

export class OptionalMemberExpressionMatcher extends Matcher<
  t.OptionalMemberExpression
> {
  constructor(
    private readonly object?: Matcher<t.Expression>,
    private readonly property?: Matcher<any>,
    private readonly computed?: Matcher<boolean> | boolean,
    private readonly optional?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.OptionalMemberExpression {
    if (!isNode(node) || !t.isOptionalMemberExpression(node)) {
      return false;
    }

    if (typeof this.object === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.object.matchValue(node.object, [...keys, 'object'])) {
      return false;
    }

    if (typeof this.property === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.property.matchValue(node.property, [...keys, 'property'])
    ) {
      return false;
    }

    if (typeof this.computed === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.computed === 'boolean') {
      if (this.computed !== node.computed) {
        return false;
      }
    } else if (
      !this.computed.matchValue(node.computed, [...keys, 'computed'])
    ) {
      return false;
    }

    if (typeof this.optional === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.optional === 'boolean') {
      if (this.optional !== node.optional) {
        return false;
      }
    } else if (
      !this.optional.matchValue(node.optional, [...keys, 'optional'])
    ) {
      return false;
    }

    return true;
  }
}

export function optionalMemberExpression(
  object?: Matcher<t.Expression>,
  property?: Matcher<any>,
  computed?: Matcher<boolean> | boolean,
  optional?: Matcher<boolean> | boolean
): Matcher<t.OptionalMemberExpression> {
  return new OptionalMemberExpressionMatcher(
    object,
    property,
    computed,
    optional
  );
}

export class ParenthesizedExpressionMatcher extends Matcher<
  t.ParenthesizedExpression
> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ParenthesizedExpression {
    if (!isNode(node) || !t.isParenthesizedExpression(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function parenthesizedExpression(
  expression?: Matcher<t.Expression>
): Matcher<t.ParenthesizedExpression> {
  return new ParenthesizedExpressionMatcher(expression);
}

export class PipelineBareFunctionMatcher extends Matcher<
  t.PipelineBareFunction
> {
  constructor(private readonly callee?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.PipelineBareFunction {
    if (!isNode(node) || !t.isPipelineBareFunction(node)) {
      return false;
    }

    if (typeof this.callee === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.callee.matchValue(node.callee, [...keys, 'callee'])) {
      return false;
    }

    return true;
  }
}

export function pipelineBareFunction(
  callee?: Matcher<t.Expression>
): Matcher<t.PipelineBareFunction> {
  return new PipelineBareFunctionMatcher(callee);
}

export class PipelinePrimaryTopicReferenceMatcher extends Matcher<
  t.PipelinePrimaryTopicReference
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.PipelinePrimaryTopicReference {
    if (!isNode(node) || !t.isPipelinePrimaryTopicReference(node)) {
      return false;
    }

    return true;
  }
}

export function pipelinePrimaryTopicReference(): Matcher<
  t.PipelinePrimaryTopicReference
> {
  return new PipelinePrimaryTopicReferenceMatcher();
}

export class PipelineTopicExpressionMatcher extends Matcher<
  t.PipelineTopicExpression
> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.PipelineTopicExpression {
    if (!isNode(node) || !t.isPipelineTopicExpression(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function pipelineTopicExpression(
  expression?: Matcher<t.Expression>
): Matcher<t.PipelineTopicExpression> {
  return new PipelineTopicExpressionMatcher(expression);
}

export class PlaceholderMatcher extends Matcher<t.Placeholder> {
  constructor(
    private readonly expectedNode?:
      | Matcher<
          | 'Identifier'
          | 'StringLiteral'
          | 'Expression'
          | 'Statement'
          | 'Declaration'
          | 'BlockStatement'
          | 'ClassBody'
          | 'Pattern'
        >
      | string,
    private readonly name?: Matcher<t.Identifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Placeholder {
    if (!isNode(node) || !t.isPlaceholder(node)) {
      return false;
    }

    if (typeof this.expectedNode === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.expectedNode === 'string') {
      if (this.expectedNode !== node.expectedNode) {
        return false;
      }
    } else if (
      !this.expectedNode.matchValue(node.expectedNode, [
        ...keys,
        'expectedNode'
      ])
    ) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function placeholder(
  expectedNode?:
    | Matcher<
        | 'Identifier'
        | 'StringLiteral'
        | 'Expression'
        | 'Statement'
        | 'Declaration'
        | 'BlockStatement'
        | 'ClassBody'
        | 'Pattern'
      >
    | string,
  name?: Matcher<t.Identifier>
): Matcher<t.Placeholder> {
  return new PlaceholderMatcher(expectedNode, name);
}

export class PrivateNameMatcher extends Matcher<t.PrivateName> {
  constructor(private readonly id?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.PrivateName {
    if (!isNode(node) || !t.isPrivateName(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    return true;
  }
}

export function privateName(
  id?: Matcher<t.Identifier>
): Matcher<t.PrivateName> {
  return new PrivateNameMatcher(id);
}

export class ProgramMatcher extends Matcher<t.Program> {
  constructor(
    private readonly body?:
      | Matcher<Array<t.Statement>>
      | Array<Matcher<t.Statement>>,
    private readonly directives?:
      | Matcher<Array<t.Directive>>
      | Array<Matcher<t.Directive>>,
    private readonly sourceType?: Matcher<'script' | 'module'> | string,
    private readonly interpreter?: Matcher<t.InterpreterDirective> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Program {
    if (!isNode(node) || !t.isProgram(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.body)) {
      if (
        !tupleOf<unknown>(...this.body).matchValue(node.body, [...keys, 'body'])
      ) {
        return false;
      }
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    if (typeof this.directives === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.directives)) {
      if (
        !tupleOf<unknown>(...this.directives).matchValue(node.directives, [
          ...keys,
          'directives'
        ])
      ) {
        return false;
      }
    } else if (
      !this.directives.matchValue(node.directives, [...keys, 'directives'])
    ) {
      return false;
    }

    if (typeof this.sourceType === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.sourceType === 'string') {
      if (this.sourceType !== node.sourceType) {
        return false;
      }
    } else if (
      !this.sourceType.matchValue(node.sourceType, [...keys, 'sourceType'])
    ) {
      return false;
    }

    if (typeof this.interpreter === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.interpreter === null) {
      // null matcher means we expect null value
      if (node.interpreter !== null) {
        return false;
      }
    } else if (node.interpreter === null) {
      return false;
    } else if (
      !this.interpreter.matchValue(node.interpreter, [...keys, 'interpreter'])
    ) {
      return false;
    }

    return true;
  }
}

export function program(
  body?: Matcher<Array<t.Statement>> | Array<Matcher<t.Statement>>,
  directives?: Matcher<Array<t.Directive>> | Array<Matcher<t.Directive>>,
  sourceType?: Matcher<'script' | 'module'> | string,
  interpreter?: Matcher<t.InterpreterDirective> | null
): Matcher<t.Program> {
  return new ProgramMatcher(body, directives, sourceType, interpreter);
}

export class QualifiedTypeIdentifierMatcher extends Matcher<
  t.QualifiedTypeIdentifier
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly qualification?: Matcher<
      t.Identifier | t.QualifiedTypeIdentifier
    >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.QualifiedTypeIdentifier {
    if (!isNode(node) || !t.isQualifiedTypeIdentifier(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.qualification === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.qualification.matchValue(node.qualification, [
        ...keys,
        'qualification'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function qualifiedTypeIdentifier(
  id?: Matcher<t.Identifier>,
  qualification?: Matcher<t.Identifier | t.QualifiedTypeIdentifier>
): Matcher<t.QualifiedTypeIdentifier> {
  return new QualifiedTypeIdentifierMatcher(id, qualification);
}

export class RegExpLiteralMatcher extends Matcher<t.RegExpLiteral> {
  constructor(
    private readonly pattern?: Matcher<string> | string,
    private readonly flags?: Matcher<string> | string
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.RegExpLiteral {
    if (!isNode(node) || !t.isRegExpLiteral(node)) {
      return false;
    }

    if (typeof this.pattern === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.pattern === 'string') {
      if (this.pattern !== node.pattern) {
        return false;
      }
    } else if (!this.pattern.matchValue(node.pattern, [...keys, 'pattern'])) {
      return false;
    }

    if (typeof this.flags === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.flags === 'string') {
      if (this.flags !== node.flags) {
        return false;
      }
    } else if (!this.flags.matchValue(node.flags, [...keys, 'flags'])) {
      return false;
    }

    return true;
  }
}

export function regExpLiteral(
  pattern?: Matcher<string> | string,
  flags?: Matcher<string> | string
): Matcher<t.RegExpLiteral> {
  return new RegExpLiteralMatcher(pattern, flags);
}

export class RestElementMatcher extends Matcher<t.RestElement> {
  constructor(private readonly argument?: Matcher<t.LVal>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.RestElement {
    if (!isNode(node) || !t.isRestElement(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function restElement(
  argument?: Matcher<t.LVal>
): Matcher<t.RestElement> {
  return new RestElementMatcher(argument);
}

export class ReturnStatementMatcher extends Matcher<t.ReturnStatement> {
  constructor(private readonly argument?: Matcher<t.Expression> | null) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ReturnStatement {
    if (!isNode(node) || !t.isReturnStatement(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.argument === null) {
      // null matcher means we expect null value
      if (node.argument !== null) {
        return false;
      }
    } else if (node.argument === null) {
      return false;
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function returnStatement(
  argument?: Matcher<t.Expression> | null
): Matcher<t.ReturnStatement> {
  return new ReturnStatementMatcher(argument);
}

export class SequenceExpressionMatcher extends Matcher<t.SequenceExpression> {
  constructor(
    private readonly expressions?:
      | Matcher<Array<t.Expression>>
      | Array<Matcher<t.Expression>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.SequenceExpression {
    if (!isNode(node) || !t.isSequenceExpression(node)) {
      return false;
    }

    if (typeof this.expressions === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.expressions)) {
      if (
        !tupleOf<unknown>(...this.expressions).matchValue(node.expressions, [
          ...keys,
          'expressions'
        ])
      ) {
        return false;
      }
    } else if (
      !this.expressions.matchValue(node.expressions, [...keys, 'expressions'])
    ) {
      return false;
    }

    return true;
  }
}

export function sequenceExpression(
  expressions?: Matcher<Array<t.Expression>> | Array<Matcher<t.Expression>>
): Matcher<t.SequenceExpression> {
  return new SequenceExpressionMatcher(expressions);
}

export class SpreadElementMatcher extends Matcher<t.SpreadElement> {
  constructor(private readonly argument?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.SpreadElement {
    if (!isNode(node) || !t.isSpreadElement(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function spreadElement(
  argument?: Matcher<t.Expression>
): Matcher<t.SpreadElement> {
  return new SpreadElementMatcher(argument);
}

export class StringLiteralMatcher extends Matcher<t.StringLiteral> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.StringLiteral {
    if (!isNode(node) || !t.isStringLiteral(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function stringLiteral(
  value?: Matcher<string> | string
): Matcher<t.StringLiteral> {
  return new StringLiteralMatcher(value);
}

export class StringLiteralTypeAnnotationMatcher extends Matcher<
  t.StringLiteralTypeAnnotation
> {
  constructor(private readonly value?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.StringLiteralTypeAnnotation {
    if (!isNode(node) || !t.isStringLiteralTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.value === 'string') {
      if (this.value !== node.value) {
        return false;
      }
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    return true;
  }
}

export function stringLiteralTypeAnnotation(
  value?: Matcher<string> | string
): Matcher<t.StringLiteralTypeAnnotation> {
  return new StringLiteralTypeAnnotationMatcher(value);
}

export class StringTypeAnnotationMatcher extends Matcher<
  t.StringTypeAnnotation
> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.StringTypeAnnotation {
    if (!isNode(node) || !t.isStringTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function stringTypeAnnotation(): Matcher<t.StringTypeAnnotation> {
  return new StringTypeAnnotationMatcher();
}

export class SuperMatcher extends Matcher<t.Super> {
  constructor() {
    super();
  }

  matchValue(node: unknown, keys: ReadonlyArray<PropertyKey>): node is t.Super {
    if (!isNode(node) || !t.isSuper(node)) {
      return false;
    }

    return true;
  }
}

export function Super(): Matcher<t.Super> {
  return new SuperMatcher();
}

export class SwitchCaseMatcher extends Matcher<t.SwitchCase> {
  constructor(
    private readonly test?: Matcher<t.Expression> | null,
    private readonly consequent?:
      | Matcher<Array<t.Statement>>
      | Array<Matcher<t.Statement>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.SwitchCase {
    if (!isNode(node) || !t.isSwitchCase(node)) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.test === null) {
      // null matcher means we expect null value
      if (node.test !== null) {
        return false;
      }
    } else if (node.test === null) {
      return false;
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.consequent === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.consequent)) {
      if (
        !tupleOf<unknown>(...this.consequent).matchValue(node.consequent, [
          ...keys,
          'consequent'
        ])
      ) {
        return false;
      }
    } else if (
      !this.consequent.matchValue(node.consequent, [...keys, 'consequent'])
    ) {
      return false;
    }

    return true;
  }
}

export function switchCase(
  test?: Matcher<t.Expression> | null,
  consequent?: Matcher<Array<t.Statement>> | Array<Matcher<t.Statement>>
): Matcher<t.SwitchCase> {
  return new SwitchCaseMatcher(test, consequent);
}

export class SwitchStatementMatcher extends Matcher<t.SwitchStatement> {
  constructor(
    private readonly discriminant?: Matcher<t.Expression>,
    private readonly cases?:
      | Matcher<Array<t.SwitchCase>>
      | Array<Matcher<t.SwitchCase>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.SwitchStatement {
    if (!isNode(node) || !t.isSwitchStatement(node)) {
      return false;
    }

    if (typeof this.discriminant === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.discriminant.matchValue(node.discriminant, [
        ...keys,
        'discriminant'
      ])
    ) {
      return false;
    }

    if (typeof this.cases === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.cases)) {
      if (
        !tupleOf<unknown>(...this.cases).matchValue(node.cases, [
          ...keys,
          'cases'
        ])
      ) {
        return false;
      }
    } else if (!this.cases.matchValue(node.cases, [...keys, 'cases'])) {
      return false;
    }

    return true;
  }
}

export function switchStatement(
  discriminant?: Matcher<t.Expression>,
  cases?: Matcher<Array<t.SwitchCase>> | Array<Matcher<t.SwitchCase>>
): Matcher<t.SwitchStatement> {
  return new SwitchStatementMatcher(discriminant, cases);
}

export class TSAnyKeywordMatcher extends Matcher<t.TSAnyKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSAnyKeyword {
    if (!isNode(node) || !t.isTSAnyKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsAnyKeyword(): Matcher<t.TSAnyKeyword> {
  return new TSAnyKeywordMatcher();
}

export class TSArrayTypeMatcher extends Matcher<t.TSArrayType> {
  constructor(private readonly elementType?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSArrayType {
    if (!isNode(node) || !t.isTSArrayType(node)) {
      return false;
    }

    if (typeof this.elementType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.elementType.matchValue(node.elementType, [...keys, 'elementType'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsArrayType(
  elementType?: Matcher<t.TSType>
): Matcher<t.TSArrayType> {
  return new TSArrayTypeMatcher(elementType);
}

export class TSAsExpressionMatcher extends Matcher<t.TSAsExpression> {
  constructor(
    private readonly expression?: Matcher<t.Expression>,
    private readonly typeAnnotation?: Matcher<t.TSType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSAsExpression {
    if (!isNode(node) || !t.isTSAsExpression(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsAsExpression(
  expression?: Matcher<t.Expression>,
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSAsExpression> {
  return new TSAsExpressionMatcher(expression, typeAnnotation);
}

export class TSBigIntKeywordMatcher extends Matcher<t.TSBigIntKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSBigIntKeyword {
    if (!isNode(node) || !t.isTSBigIntKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsBigIntKeyword(): Matcher<t.TSBigIntKeyword> {
  return new TSBigIntKeywordMatcher();
}

export class TSBooleanKeywordMatcher extends Matcher<t.TSBooleanKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSBooleanKeyword {
    if (!isNode(node) || !t.isTSBooleanKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsBooleanKeyword(): Matcher<t.TSBooleanKeyword> {
  return new TSBooleanKeywordMatcher();
}

export class TSCallSignatureDeclarationMatcher extends Matcher<
  t.TSCallSignatureDeclaration
> {
  constructor(
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly parameters?:
      | Matcher<Array<t.Identifier | t.RestElement>>
      | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSCallSignatureDeclaration {
    if (!isNode(node) || !t.isTSCallSignatureDeclaration(node)) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsCallSignatureDeclaration(
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  parameters?:
    | Matcher<Array<t.Identifier | t.RestElement>>
    | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSCallSignatureDeclaration> {
  return new TSCallSignatureDeclarationMatcher(
    typeParameters,
    parameters,
    typeAnnotation
  );
}

export class TSConditionalTypeMatcher extends Matcher<t.TSConditionalType> {
  constructor(
    private readonly checkType?: Matcher<t.TSType>,
    private readonly extendsType?: Matcher<t.TSType>,
    private readonly trueType?: Matcher<t.TSType>,
    private readonly falseType?: Matcher<t.TSType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSConditionalType {
    if (!isNode(node) || !t.isTSConditionalType(node)) {
      return false;
    }

    if (typeof this.checkType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.checkType.matchValue(node.checkType, [...keys, 'checkType'])
    ) {
      return false;
    }

    if (typeof this.extendsType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.extendsType.matchValue(node.extendsType, [...keys, 'extendsType'])
    ) {
      return false;
    }

    if (typeof this.trueType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.trueType.matchValue(node.trueType, [...keys, 'trueType'])
    ) {
      return false;
    }

    if (typeof this.falseType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.falseType.matchValue(node.falseType, [...keys, 'falseType'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsConditionalType(
  checkType?: Matcher<t.TSType>,
  extendsType?: Matcher<t.TSType>,
  trueType?: Matcher<t.TSType>,
  falseType?: Matcher<t.TSType>
): Matcher<t.TSConditionalType> {
  return new TSConditionalTypeMatcher(
    checkType,
    extendsType,
    trueType,
    falseType
  );
}

export class TSConstructSignatureDeclarationMatcher extends Matcher<
  t.TSConstructSignatureDeclaration
> {
  constructor(
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly parameters?:
      | Matcher<Array<t.Identifier | t.RestElement>>
      | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSConstructSignatureDeclaration {
    if (!isNode(node) || !t.isTSConstructSignatureDeclaration(node)) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsConstructSignatureDeclaration(
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  parameters?:
    | Matcher<Array<t.Identifier | t.RestElement>>
    | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSConstructSignatureDeclaration> {
  return new TSConstructSignatureDeclarationMatcher(
    typeParameters,
    parameters,
    typeAnnotation
  );
}

export class TSConstructorTypeMatcher extends Matcher<t.TSConstructorType> {
  constructor(
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly parameters?:
      | Matcher<Array<t.Identifier | t.RestElement>>
      | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSConstructorType {
    if (!isNode(node) || !t.isTSConstructorType(node)) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsConstructorType(
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  parameters?:
    | Matcher<Array<t.Identifier | t.RestElement>>
    | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSConstructorType> {
  return new TSConstructorTypeMatcher(
    typeParameters,
    parameters,
    typeAnnotation
  );
}

export class TSDeclareFunctionMatcher extends Matcher<t.TSDeclareFunction> {
  constructor(
    private readonly id?: Matcher<t.Identifier> | null,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration | t.Noop
    > | null,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly returnType?: Matcher<t.TSTypeAnnotation | t.Noop> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSDeclareFunction {
    if (!isNode(node) || !t.isTSDeclareFunction(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.id === null) {
      // null matcher means we expect null value
      if (node.id !== null) {
        return false;
      }
    } else if (node.id === null) {
      return false;
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.returnType === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.returnType === null) {
      // null matcher means we expect null value
      if (node.returnType !== null) {
        return false;
      }
    } else if (node.returnType === null) {
      return false;
    } else if (
      !this.returnType.matchValue(node.returnType, [...keys, 'returnType'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsDeclareFunction(
  id?: Matcher<t.Identifier> | null,
  typeParameters?: Matcher<t.TSTypeParameterDeclaration | t.Noop> | null,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  returnType?: Matcher<t.TSTypeAnnotation | t.Noop> | null
): Matcher<t.TSDeclareFunction> {
  return new TSDeclareFunctionMatcher(id, typeParameters, params, returnType);
}

export class TSDeclareMethodMatcher extends Matcher<t.TSDeclareMethod> {
  constructor(
    private readonly decorators?:
      | Matcher<Array<t.Decorator>>
      | Array<Matcher<t.Decorator>>
      | null,
    private readonly key?: Matcher<
      t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
    >,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration | t.Noop
    > | null,
    private readonly params?:
      | Matcher<
          Array<
            t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
          >
        >
      | Array<
          | Matcher<t.Identifier>
          | Matcher<t.Pattern>
          | Matcher<t.RestElement>
          | Matcher<t.TSParameterProperty>
        >,
    private readonly returnType?: Matcher<t.TSTypeAnnotation | t.Noop> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSDeclareMethod {
    if (!isNode(node) || !t.isTSDeclareMethod(node)) {
      return false;
    }

    if (typeof this.decorators === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.decorators === null) {
      // null matcher means we expect null value
      if (node.decorators !== null) {
        return false;
      }
    } else if (node.decorators === null) {
      return false;
    } else if (Array.isArray(this.decorators)) {
      if (
        !tupleOf<unknown>(...this.decorators).matchValue(node.decorators, [
          ...keys,
          'decorators'
        ])
      ) {
        return false;
      }
    } else if (
      !this.decorators.matchValue(node.decorators, [...keys, 'decorators'])
    ) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    if (typeof this.returnType === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.returnType === null) {
      // null matcher means we expect null value
      if (node.returnType !== null) {
        return false;
      }
    } else if (node.returnType === null) {
      return false;
    } else if (
      !this.returnType.matchValue(node.returnType, [...keys, 'returnType'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsDeclareMethod(
  decorators?: Matcher<Array<t.Decorator>> | Array<Matcher<t.Decorator>> | null,
  key?: Matcher<
    t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression
  >,
  typeParameters?: Matcher<t.TSTypeParameterDeclaration | t.Noop> | null,
  params?:
    | Matcher<
        Array<t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty>
      >
    | Array<
        | Matcher<t.Identifier>
        | Matcher<t.Pattern>
        | Matcher<t.RestElement>
        | Matcher<t.TSParameterProperty>
      >,
  returnType?: Matcher<t.TSTypeAnnotation | t.Noop> | null
): Matcher<t.TSDeclareMethod> {
  return new TSDeclareMethodMatcher(
    decorators,
    key,
    typeParameters,
    params,
    returnType
  );
}

export class TSEnumDeclarationMatcher extends Matcher<t.TSEnumDeclaration> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly members?:
      | Matcher<Array<t.TSEnumMember>>
      | Array<Matcher<t.TSEnumMember>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSEnumDeclaration {
    if (!isNode(node) || !t.isTSEnumDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.members === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.members)) {
      if (
        !tupleOf<unknown>(...this.members).matchValue(node.members, [
          ...keys,
          'members'
        ])
      ) {
        return false;
      }
    } else if (!this.members.matchValue(node.members, [...keys, 'members'])) {
      return false;
    }

    return true;
  }
}

export function tsEnumDeclaration(
  id?: Matcher<t.Identifier>,
  members?: Matcher<Array<t.TSEnumMember>> | Array<Matcher<t.TSEnumMember>>
): Matcher<t.TSEnumDeclaration> {
  return new TSEnumDeclarationMatcher(id, members);
}

export class TSEnumMemberMatcher extends Matcher<t.TSEnumMember> {
  constructor(
    private readonly id?: Matcher<t.Identifier | t.StringLiteral>,
    private readonly initializer?: Matcher<t.Expression> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSEnumMember {
    if (!isNode(node) || !t.isTSEnumMember(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.initializer === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.initializer === null) {
      // null matcher means we expect null value
      if (node.initializer !== null) {
        return false;
      }
    } else if (node.initializer === null) {
      return false;
    } else if (
      !this.initializer.matchValue(node.initializer, [...keys, 'initializer'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsEnumMember(
  id?: Matcher<t.Identifier | t.StringLiteral>,
  initializer?: Matcher<t.Expression> | null
): Matcher<t.TSEnumMember> {
  return new TSEnumMemberMatcher(id, initializer);
}

export class TSExportAssignmentMatcher extends Matcher<t.TSExportAssignment> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSExportAssignment {
    if (!isNode(node) || !t.isTSExportAssignment(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsExportAssignment(
  expression?: Matcher<t.Expression>
): Matcher<t.TSExportAssignment> {
  return new TSExportAssignmentMatcher(expression);
}

export class TSExpressionWithTypeArgumentsMatcher extends Matcher<
  t.TSExpressionWithTypeArguments
> {
  constructor(
    private readonly expression?: Matcher<t.TSEntityName>,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSExpressionWithTypeArguments {
    if (!isNode(node) || !t.isTSExpressionWithTypeArguments(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsExpressionWithTypeArguments(
  expression?: Matcher<t.TSEntityName>,
  typeParameters?: Matcher<t.TSTypeParameterInstantiation> | null
): Matcher<t.TSExpressionWithTypeArguments> {
  return new TSExpressionWithTypeArgumentsMatcher(expression, typeParameters);
}

export class TSExternalModuleReferenceMatcher extends Matcher<
  t.TSExternalModuleReference
> {
  constructor(private readonly expression?: Matcher<t.StringLiteral>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSExternalModuleReference {
    if (!isNode(node) || !t.isTSExternalModuleReference(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsExternalModuleReference(
  expression?: Matcher<t.StringLiteral>
): Matcher<t.TSExternalModuleReference> {
  return new TSExternalModuleReferenceMatcher(expression);
}

export class TSFunctionTypeMatcher extends Matcher<t.TSFunctionType> {
  constructor(
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly parameters?:
      | Matcher<Array<t.Identifier | t.RestElement>>
      | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSFunctionType {
    if (!isNode(node) || !t.isTSFunctionType(node)) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsFunctionType(
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  parameters?:
    | Matcher<Array<t.Identifier | t.RestElement>>
    | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSFunctionType> {
  return new TSFunctionTypeMatcher(typeParameters, parameters, typeAnnotation);
}

export class TSImportEqualsDeclarationMatcher extends Matcher<
  t.TSImportEqualsDeclaration
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly moduleReference?: Matcher<
      t.TSEntityName | t.TSExternalModuleReference
    >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSImportEqualsDeclaration {
    if (!isNode(node) || !t.isTSImportEqualsDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.moduleReference === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.moduleReference.matchValue(node.moduleReference, [
        ...keys,
        'moduleReference'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsImportEqualsDeclaration(
  id?: Matcher<t.Identifier>,
  moduleReference?: Matcher<t.TSEntityName | t.TSExternalModuleReference>
): Matcher<t.TSImportEqualsDeclaration> {
  return new TSImportEqualsDeclarationMatcher(id, moduleReference);
}

export class TSImportTypeMatcher extends Matcher<t.TSImportType> {
  constructor(
    private readonly argument?: Matcher<t.StringLiteral>,
    private readonly qualifier?: Matcher<t.TSEntityName> | null,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSImportType {
    if (!isNode(node) || !t.isTSImportType(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    if (typeof this.qualifier === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.qualifier === null) {
      // null matcher means we expect null value
      if (node.qualifier !== null) {
        return false;
      }
    } else if (node.qualifier === null) {
      return false;
    } else if (
      !this.qualifier.matchValue(node.qualifier, [...keys, 'qualifier'])
    ) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsImportType(
  argument?: Matcher<t.StringLiteral>,
  qualifier?: Matcher<t.TSEntityName> | null,
  typeParameters?: Matcher<t.TSTypeParameterInstantiation> | null
): Matcher<t.TSImportType> {
  return new TSImportTypeMatcher(argument, qualifier, typeParameters);
}

export class TSIndexSignatureMatcher extends Matcher<t.TSIndexSignature> {
  constructor(
    private readonly parameters?:
      | Matcher<Array<t.Identifier>>
      | Array<Matcher<t.Identifier>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSIndexSignature {
    if (!isNode(node) || !t.isTSIndexSignature(node)) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsIndexSignature(
  parameters?: Matcher<Array<t.Identifier>> | Array<Matcher<t.Identifier>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSIndexSignature> {
  return new TSIndexSignatureMatcher(parameters, typeAnnotation);
}

export class TSIndexedAccessTypeMatcher extends Matcher<t.TSIndexedAccessType> {
  constructor(
    private readonly objectType?: Matcher<t.TSType>,
    private readonly indexType?: Matcher<t.TSType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSIndexedAccessType {
    if (!isNode(node) || !t.isTSIndexedAccessType(node)) {
      return false;
    }

    if (typeof this.objectType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.objectType.matchValue(node.objectType, [...keys, 'objectType'])
    ) {
      return false;
    }

    if (typeof this.indexType === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.indexType.matchValue(node.indexType, [...keys, 'indexType'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsIndexedAccessType(
  objectType?: Matcher<t.TSType>,
  indexType?: Matcher<t.TSType>
): Matcher<t.TSIndexedAccessType> {
  return new TSIndexedAccessTypeMatcher(objectType, indexType);
}

export class TSInferTypeMatcher extends Matcher<t.TSInferType> {
  constructor(private readonly typeParameter?: Matcher<t.TSTypeParameter>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSInferType {
    if (!isNode(node) || !t.isTSInferType(node)) {
      return false;
    }

    if (typeof this.typeParameter === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeParameter.matchValue(node.typeParameter, [
        ...keys,
        'typeParameter'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsInferType(
  typeParameter?: Matcher<t.TSTypeParameter>
): Matcher<t.TSInferType> {
  return new TSInferTypeMatcher(typeParameter);
}

export class TSInterfaceBodyMatcher extends Matcher<t.TSInterfaceBody> {
  constructor(
    private readonly body?:
      | Matcher<Array<t.TSTypeElement>>
      | Array<Matcher<t.TSTypeElement>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSInterfaceBody {
    if (!isNode(node) || !t.isTSInterfaceBody(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.body)) {
      if (
        !tupleOf<unknown>(...this.body).matchValue(node.body, [...keys, 'body'])
      ) {
        return false;
      }
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function tsInterfaceBody(
  body?: Matcher<Array<t.TSTypeElement>> | Array<Matcher<t.TSTypeElement>>
): Matcher<t.TSInterfaceBody> {
  return new TSInterfaceBodyMatcher(body);
}

export class TSInterfaceDeclarationMatcher extends Matcher<
  t.TSInterfaceDeclaration
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly _extends?:
      | Matcher<Array<t.TSExpressionWithTypeArguments>>
      | Array<Matcher<t.TSExpressionWithTypeArguments>>
      | null,
    private readonly body?: Matcher<t.TSInterfaceBody>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSInterfaceDeclaration {
    if (!isNode(node) || !t.isTSInterfaceDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this._extends === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._extends === null) {
      // null matcher means we expect null value
      if (node.extends !== null) {
        return false;
      }
    } else if (node.extends === null) {
      return false;
    } else if (Array.isArray(this._extends)) {
      if (
        !tupleOf<unknown>(...this._extends).matchValue(node.extends, [
          ...keys,
          'extends'
        ])
      ) {
        return false;
      }
    } else if (!this._extends.matchValue(node.extends, [...keys, 'extends'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function tsInterfaceDeclaration(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  _extends?:
    | Matcher<Array<t.TSExpressionWithTypeArguments>>
    | Array<Matcher<t.TSExpressionWithTypeArguments>>
    | null,
  body?: Matcher<t.TSInterfaceBody>
): Matcher<t.TSInterfaceDeclaration> {
  return new TSInterfaceDeclarationMatcher(id, typeParameters, _extends, body);
}

export class TSIntersectionTypeMatcher extends Matcher<t.TSIntersectionType> {
  constructor(
    private readonly types?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSIntersectionType {
    if (!isNode(node) || !t.isTSIntersectionType(node)) {
      return false;
    }

    if (typeof this.types === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.types)) {
      if (
        !tupleOf<unknown>(...this.types).matchValue(node.types, [
          ...keys,
          'types'
        ])
      ) {
        return false;
      }
    } else if (!this.types.matchValue(node.types, [...keys, 'types'])) {
      return false;
    }

    return true;
  }
}

export function tsIntersectionType(
  types?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
): Matcher<t.TSIntersectionType> {
  return new TSIntersectionTypeMatcher(types);
}

export class TSLiteralTypeMatcher extends Matcher<t.TSLiteralType> {
  constructor(
    private readonly literal?: Matcher<
      t.NumericLiteral | t.StringLiteral | t.BooleanLiteral
    >
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSLiteralType {
    if (!isNode(node) || !t.isTSLiteralType(node)) {
      return false;
    }

    if (typeof this.literal === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.literal.matchValue(node.literal, [...keys, 'literal'])) {
      return false;
    }

    return true;
  }
}

export function tsLiteralType(
  literal?: Matcher<t.NumericLiteral | t.StringLiteral | t.BooleanLiteral>
): Matcher<t.TSLiteralType> {
  return new TSLiteralTypeMatcher(literal);
}

export class TSMappedTypeMatcher extends Matcher<t.TSMappedType> {
  constructor(
    private readonly typeParameter?: Matcher<t.TSTypeParameter>,
    private readonly typeAnnotation?: Matcher<t.TSType> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSMappedType {
    if (!isNode(node) || !t.isTSMappedType(node)) {
      return false;
    }

    if (typeof this.typeParameter === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeParameter.matchValue(node.typeParameter, [
        ...keys,
        'typeParameter'
      ])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsMappedType(
  typeParameter?: Matcher<t.TSTypeParameter>,
  typeAnnotation?: Matcher<t.TSType> | null
): Matcher<t.TSMappedType> {
  return new TSMappedTypeMatcher(typeParameter, typeAnnotation);
}

export class TSMethodSignatureMatcher extends Matcher<t.TSMethodSignature> {
  constructor(
    private readonly key?: Matcher<t.Expression>,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly parameters?:
      | Matcher<Array<t.Identifier | t.RestElement>>
      | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSMethodSignature {
    if (!isNode(node) || !t.isTSMethodSignature(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.parameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.parameters)) {
      if (
        !tupleOf<unknown>(...this.parameters).matchValue(node.parameters, [
          ...keys,
          'parameters'
        ])
      ) {
        return false;
      }
    } else if (
      !this.parameters.matchValue(node.parameters, [...keys, 'parameters'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsMethodSignature(
  key?: Matcher<t.Expression>,
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  parameters?:
    | Matcher<Array<t.Identifier | t.RestElement>>
    | Array<Matcher<t.Identifier> | Matcher<t.RestElement>>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null
): Matcher<t.TSMethodSignature> {
  return new TSMethodSignatureMatcher(
    key,
    typeParameters,
    parameters,
    typeAnnotation
  );
}

export class TSModuleBlockMatcher extends Matcher<t.TSModuleBlock> {
  constructor(
    private readonly body?:
      | Matcher<Array<t.Statement>>
      | Array<Matcher<t.Statement>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSModuleBlock {
    if (!isNode(node) || !t.isTSModuleBlock(node)) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.body)) {
      if (
        !tupleOf<unknown>(...this.body).matchValue(node.body, [...keys, 'body'])
      ) {
        return false;
      }
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function tsModuleBlock(
  body?: Matcher<Array<t.Statement>> | Array<Matcher<t.Statement>>
): Matcher<t.TSModuleBlock> {
  return new TSModuleBlockMatcher(body);
}

export class TSModuleDeclarationMatcher extends Matcher<t.TSModuleDeclaration> {
  constructor(
    private readonly id?: Matcher<t.Identifier | t.StringLiteral>,
    private readonly body?: Matcher<t.TSModuleBlock | t.TSModuleDeclaration>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSModuleDeclaration {
    if (!isNode(node) || !t.isTSModuleDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function tsModuleDeclaration(
  id?: Matcher<t.Identifier | t.StringLiteral>,
  body?: Matcher<t.TSModuleBlock | t.TSModuleDeclaration>
): Matcher<t.TSModuleDeclaration> {
  return new TSModuleDeclarationMatcher(id, body);
}

export class TSNamespaceExportDeclarationMatcher extends Matcher<
  t.TSNamespaceExportDeclaration
> {
  constructor(private readonly id?: Matcher<t.Identifier>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSNamespaceExportDeclaration {
    if (!isNode(node) || !t.isTSNamespaceExportDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    return true;
  }
}

export function tsNamespaceExportDeclaration(
  id?: Matcher<t.Identifier>
): Matcher<t.TSNamespaceExportDeclaration> {
  return new TSNamespaceExportDeclarationMatcher(id);
}

export class TSNeverKeywordMatcher extends Matcher<t.TSNeverKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSNeverKeyword {
    if (!isNode(node) || !t.isTSNeverKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsNeverKeyword(): Matcher<t.TSNeverKeyword> {
  return new TSNeverKeywordMatcher();
}

export class TSNonNullExpressionMatcher extends Matcher<t.TSNonNullExpression> {
  constructor(private readonly expression?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSNonNullExpression {
    if (!isNode(node) || !t.isTSNonNullExpression(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsNonNullExpression(
  expression?: Matcher<t.Expression>
): Matcher<t.TSNonNullExpression> {
  return new TSNonNullExpressionMatcher(expression);
}

export class TSNullKeywordMatcher extends Matcher<t.TSNullKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSNullKeyword {
    if (!isNode(node) || !t.isTSNullKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsNullKeyword(): Matcher<t.TSNullKeyword> {
  return new TSNullKeywordMatcher();
}

export class TSNumberKeywordMatcher extends Matcher<t.TSNumberKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSNumberKeyword {
    if (!isNode(node) || !t.isTSNumberKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsNumberKeyword(): Matcher<t.TSNumberKeyword> {
  return new TSNumberKeywordMatcher();
}

export class TSObjectKeywordMatcher extends Matcher<t.TSObjectKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSObjectKeyword {
    if (!isNode(node) || !t.isTSObjectKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsObjectKeyword(): Matcher<t.TSObjectKeyword> {
  return new TSObjectKeywordMatcher();
}

export class TSOptionalTypeMatcher extends Matcher<t.TSOptionalType> {
  constructor(private readonly typeAnnotation?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSOptionalType {
    if (!isNode(node) || !t.isTSOptionalType(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsOptionalType(
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSOptionalType> {
  return new TSOptionalTypeMatcher(typeAnnotation);
}

export class TSParameterPropertyMatcher extends Matcher<t.TSParameterProperty> {
  constructor(
    private readonly parameter?: Matcher<t.Identifier | t.AssignmentPattern>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSParameterProperty {
    if (!isNode(node) || !t.isTSParameterProperty(node)) {
      return false;
    }

    if (typeof this.parameter === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.parameter.matchValue(node.parameter, [...keys, 'parameter'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsParameterProperty(
  parameter?: Matcher<t.Identifier | t.AssignmentPattern>
): Matcher<t.TSParameterProperty> {
  return new TSParameterPropertyMatcher(parameter);
}

export class TSParenthesizedTypeMatcher extends Matcher<t.TSParenthesizedType> {
  constructor(private readonly typeAnnotation?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSParenthesizedType {
    if (!isNode(node) || !t.isTSParenthesizedType(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsParenthesizedType(
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSParenthesizedType> {
  return new TSParenthesizedTypeMatcher(typeAnnotation);
}

export class TSPropertySignatureMatcher extends Matcher<t.TSPropertySignature> {
  constructor(
    private readonly key?: Matcher<t.Expression>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation> | null,
    private readonly initializer?: Matcher<t.Expression> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSPropertySignature {
    if (!isNode(node) || !t.isTSPropertySignature(node)) {
      return false;
    }

    if (typeof this.key === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.key.matchValue(node.key, [...keys, 'key'])) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeAnnotation === null) {
      // null matcher means we expect null value
      if (node.typeAnnotation !== null) {
        return false;
      }
    } else if (node.typeAnnotation === null) {
      return false;
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    if (typeof this.initializer === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.initializer === null) {
      // null matcher means we expect null value
      if (node.initializer !== null) {
        return false;
      }
    } else if (node.initializer === null) {
      return false;
    } else if (
      !this.initializer.matchValue(node.initializer, [...keys, 'initializer'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsPropertySignature(
  key?: Matcher<t.Expression>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation> | null,
  initializer?: Matcher<t.Expression> | null
): Matcher<t.TSPropertySignature> {
  return new TSPropertySignatureMatcher(key, typeAnnotation, initializer);
}

export class TSQualifiedNameMatcher extends Matcher<t.TSQualifiedName> {
  constructor(
    private readonly left?: Matcher<t.TSEntityName>,
    private readonly right?: Matcher<t.Identifier>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSQualifiedName {
    if (!isNode(node) || !t.isTSQualifiedName(node)) {
      return false;
    }

    if (typeof this.left === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.left.matchValue(node.left, [...keys, 'left'])) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function tsQualifiedName(
  left?: Matcher<t.TSEntityName>,
  right?: Matcher<t.Identifier>
): Matcher<t.TSQualifiedName> {
  return new TSQualifiedNameMatcher(left, right);
}

export class TSRestTypeMatcher extends Matcher<t.TSRestType> {
  constructor(private readonly typeAnnotation?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSRestType {
    if (!isNode(node) || !t.isTSRestType(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsRestType(
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSRestType> {
  return new TSRestTypeMatcher(typeAnnotation);
}

export class TSStringKeywordMatcher extends Matcher<t.TSStringKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSStringKeyword {
    if (!isNode(node) || !t.isTSStringKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsStringKeyword(): Matcher<t.TSStringKeyword> {
  return new TSStringKeywordMatcher();
}

export class TSSymbolKeywordMatcher extends Matcher<t.TSSymbolKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSSymbolKeyword {
    if (!isNode(node) || !t.isTSSymbolKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsSymbolKeyword(): Matcher<t.TSSymbolKeyword> {
  return new TSSymbolKeywordMatcher();
}

export class TSThisTypeMatcher extends Matcher<t.TSThisType> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSThisType {
    if (!isNode(node) || !t.isTSThisType(node)) {
      return false;
    }

    return true;
  }
}

export function tsThisType(): Matcher<t.TSThisType> {
  return new TSThisTypeMatcher();
}

export class TSTupleTypeMatcher extends Matcher<t.TSTupleType> {
  constructor(
    private readonly elementTypes?:
      | Matcher<Array<t.TSType>>
      | Array<Matcher<t.TSType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTupleType {
    if (!isNode(node) || !t.isTSTupleType(node)) {
      return false;
    }

    if (typeof this.elementTypes === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.elementTypes)) {
      if (
        !tupleOf<unknown>(...this.elementTypes).matchValue(node.elementTypes, [
          ...keys,
          'elementTypes'
        ])
      ) {
        return false;
      }
    } else if (
      !this.elementTypes.matchValue(node.elementTypes, [
        ...keys,
        'elementTypes'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTupleType(
  elementTypes?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
): Matcher<t.TSTupleType> {
  return new TSTupleTypeMatcher(elementTypes);
}

export class TSTypeAliasDeclarationMatcher extends Matcher<
  t.TSTypeAliasDeclaration
> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterDeclaration
    > | null,
    private readonly typeAnnotation?: Matcher<t.TSType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeAliasDeclaration {
    if (!isNode(node) || !t.isTSTypeAliasDeclaration(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeAliasDeclaration(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TSTypeParameterDeclaration> | null,
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSTypeAliasDeclaration> {
  return new TSTypeAliasDeclarationMatcher(id, typeParameters, typeAnnotation);
}

export class TSTypeAnnotationMatcher extends Matcher<t.TSTypeAnnotation> {
  constructor(private readonly typeAnnotation?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeAnnotation {
    if (!isNode(node) || !t.isTSTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeAnnotation(
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSTypeAnnotation> {
  return new TSTypeAnnotationMatcher(typeAnnotation);
}

export class TSTypeAssertionMatcher extends Matcher<t.TSTypeAssertion> {
  constructor(
    private readonly typeAnnotation?: Matcher<t.TSType>,
    private readonly expression?: Matcher<t.Expression>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeAssertion {
    if (!isNode(node) || !t.isTSTypeAssertion(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeAssertion(
  typeAnnotation?: Matcher<t.TSType>,
  expression?: Matcher<t.Expression>
): Matcher<t.TSTypeAssertion> {
  return new TSTypeAssertionMatcher(typeAnnotation, expression);
}

export class TSTypeLiteralMatcher extends Matcher<t.TSTypeLiteral> {
  constructor(
    private readonly members?:
      | Matcher<Array<t.TSTypeElement>>
      | Array<Matcher<t.TSTypeElement>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeLiteral {
    if (!isNode(node) || !t.isTSTypeLiteral(node)) {
      return false;
    }

    if (typeof this.members === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.members)) {
      if (
        !tupleOf<unknown>(...this.members).matchValue(node.members, [
          ...keys,
          'members'
        ])
      ) {
        return false;
      }
    } else if (!this.members.matchValue(node.members, [...keys, 'members'])) {
      return false;
    }

    return true;
  }
}

export function tsTypeLiteral(
  members?: Matcher<Array<t.TSTypeElement>> | Array<Matcher<t.TSTypeElement>>
): Matcher<t.TSTypeLiteral> {
  return new TSTypeLiteralMatcher(members);
}

export class TSTypeOperatorMatcher extends Matcher<t.TSTypeOperator> {
  constructor(private readonly typeAnnotation?: Matcher<t.TSType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeOperator {
    if (!isNode(node) || !t.isTSTypeOperator(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeOperator(
  typeAnnotation?: Matcher<t.TSType>
): Matcher<t.TSTypeOperator> {
  return new TSTypeOperatorMatcher(typeAnnotation);
}

export class TSTypeParameterMatcher extends Matcher<t.TSTypeParameter> {
  constructor(
    private readonly constraint?: Matcher<t.TSType> | null,
    private readonly _default?: Matcher<t.TSType> | null,
    private readonly name?: Matcher<string> | string
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeParameter {
    if (!isNode(node) || !t.isTSTypeParameter(node)) {
      return false;
    }

    if (typeof this.constraint === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.constraint === null) {
      // null matcher means we expect null value
      if (node.constraint !== null) {
        return false;
      }
    } else if (node.constraint === null) {
      return false;
    } else if (
      !this.constraint.matchValue(node.constraint, [...keys, 'constraint'])
    ) {
      return false;
    }

    if (typeof this._default === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._default === null) {
      // null matcher means we expect null value
      if (node.default !== null) {
        return false;
      }
    } else if (node.default === null) {
      return false;
    } else if (!this._default.matchValue(node.default, [...keys, 'default'])) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.name === 'string') {
      if (this.name !== node.name) {
        return false;
      }
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function tsTypeParameter(
  constraint?: Matcher<t.TSType> | null,
  _default?: Matcher<t.TSType> | null,
  name?: Matcher<string> | string
): Matcher<t.TSTypeParameter> {
  return new TSTypeParameterMatcher(constraint, _default, name);
}

export class TSTypeParameterDeclarationMatcher extends Matcher<
  t.TSTypeParameterDeclaration
> {
  constructor(
    private readonly params?:
      | Matcher<Array<t.TSTypeParameter>>
      | Array<Matcher<t.TSTypeParameter>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeParameterDeclaration {
    if (!isNode(node) || !t.isTSTypeParameterDeclaration(node)) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    return true;
  }
}

export function tsTypeParameterDeclaration(
  params?: Matcher<Array<t.TSTypeParameter>> | Array<Matcher<t.TSTypeParameter>>
): Matcher<t.TSTypeParameterDeclaration> {
  return new TSTypeParameterDeclarationMatcher(params);
}

export class TSTypeParameterInstantiationMatcher extends Matcher<
  t.TSTypeParameterInstantiation
> {
  constructor(
    private readonly params?:
      | Matcher<Array<t.TSType>>
      | Array<Matcher<t.TSType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeParameterInstantiation {
    if (!isNode(node) || !t.isTSTypeParameterInstantiation(node)) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    return true;
  }
}

export function tsTypeParameterInstantiation(
  params?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
): Matcher<t.TSTypeParameterInstantiation> {
  return new TSTypeParameterInstantiationMatcher(params);
}

export class TSTypePredicateMatcher extends Matcher<t.TSTypePredicate> {
  constructor(
    private readonly parameterName?: Matcher<t.Identifier | t.TSThisType>,
    private readonly typeAnnotation?: Matcher<t.TSTypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypePredicate {
    if (!isNode(node) || !t.isTSTypePredicate(node)) {
      return false;
    }

    if (typeof this.parameterName === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.parameterName.matchValue(node.parameterName, [
        ...keys,
        'parameterName'
      ])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypePredicate(
  parameterName?: Matcher<t.Identifier | t.TSThisType>,
  typeAnnotation?: Matcher<t.TSTypeAnnotation>
): Matcher<t.TSTypePredicate> {
  return new TSTypePredicateMatcher(parameterName, typeAnnotation);
}

export class TSTypeQueryMatcher extends Matcher<t.TSTypeQuery> {
  constructor(
    private readonly exprName?: Matcher<t.TSEntityName | t.TSImportType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeQuery {
    if (!isNode(node) || !t.isTSTypeQuery(node)) {
      return false;
    }

    if (typeof this.exprName === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.exprName.matchValue(node.exprName, [...keys, 'exprName'])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeQuery(
  exprName?: Matcher<t.TSEntityName | t.TSImportType>
): Matcher<t.TSTypeQuery> {
  return new TSTypeQueryMatcher(exprName);
}

export class TSTypeReferenceMatcher extends Matcher<t.TSTypeReference> {
  constructor(
    private readonly typeName?: Matcher<t.TSEntityName>,
    private readonly typeParameters?: Matcher<
      t.TSTypeParameterInstantiation
    > | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSTypeReference {
    if (!isNode(node) || !t.isTSTypeReference(node)) {
      return false;
    }

    if (typeof this.typeName === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeName.matchValue(node.typeName, [...keys, 'typeName'])
    ) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function tsTypeReference(
  typeName?: Matcher<t.TSEntityName>,
  typeParameters?: Matcher<t.TSTypeParameterInstantiation> | null
): Matcher<t.TSTypeReference> {
  return new TSTypeReferenceMatcher(typeName, typeParameters);
}

export class TSUndefinedKeywordMatcher extends Matcher<t.TSUndefinedKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSUndefinedKeyword {
    if (!isNode(node) || !t.isTSUndefinedKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsUndefinedKeyword(): Matcher<t.TSUndefinedKeyword> {
  return new TSUndefinedKeywordMatcher();
}

export class TSUnionTypeMatcher extends Matcher<t.TSUnionType> {
  constructor(
    private readonly types?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSUnionType {
    if (!isNode(node) || !t.isTSUnionType(node)) {
      return false;
    }

    if (typeof this.types === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.types)) {
      if (
        !tupleOf<unknown>(...this.types).matchValue(node.types, [
          ...keys,
          'types'
        ])
      ) {
        return false;
      }
    } else if (!this.types.matchValue(node.types, [...keys, 'types'])) {
      return false;
    }

    return true;
  }
}

export function tsUnionType(
  types?: Matcher<Array<t.TSType>> | Array<Matcher<t.TSType>>
): Matcher<t.TSUnionType> {
  return new TSUnionTypeMatcher(types);
}

export class TSUnknownKeywordMatcher extends Matcher<t.TSUnknownKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSUnknownKeyword {
    if (!isNode(node) || !t.isTSUnknownKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsUnknownKeyword(): Matcher<t.TSUnknownKeyword> {
  return new TSUnknownKeywordMatcher();
}

export class TSVoidKeywordMatcher extends Matcher<t.TSVoidKeyword> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TSVoidKeyword {
    if (!isNode(node) || !t.isTSVoidKeyword(node)) {
      return false;
    }

    return true;
  }
}

export function tsVoidKeyword(): Matcher<t.TSVoidKeyword> {
  return new TSVoidKeywordMatcher();
}

export class TaggedTemplateExpressionMatcher extends Matcher<
  t.TaggedTemplateExpression
> {
  constructor(
    private readonly tag?: Matcher<t.Expression>,
    private readonly quasi?: Matcher<t.TemplateLiteral>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TaggedTemplateExpression {
    if (!isNode(node) || !t.isTaggedTemplateExpression(node)) {
      return false;
    }

    if (typeof this.tag === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.tag.matchValue(node.tag, [...keys, 'tag'])) {
      return false;
    }

    if (typeof this.quasi === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.quasi.matchValue(node.quasi, [...keys, 'quasi'])) {
      return false;
    }

    return true;
  }
}

export function taggedTemplateExpression(
  tag?: Matcher<t.Expression>,
  quasi?: Matcher<t.TemplateLiteral>
): Matcher<t.TaggedTemplateExpression> {
  return new TaggedTemplateExpressionMatcher(tag, quasi);
}

export class TemplateElementMatcher extends Matcher<t.TemplateElement> {
  constructor(
    private readonly value?: Matcher<any>,
    private readonly tail?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TemplateElement {
    if (!isNode(node) || !t.isTemplateElement(node)) {
      return false;
    }

    if (typeof this.value === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.value.matchValue(node.value, [...keys, 'value'])) {
      return false;
    }

    if (typeof this.tail === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.tail === 'boolean') {
      if (this.tail !== node.tail) {
        return false;
      }
    } else if (!this.tail.matchValue(node.tail, [...keys, 'tail'])) {
      return false;
    }

    return true;
  }
}

export function templateElement(
  value?: Matcher<any>,
  tail?: Matcher<boolean> | boolean
): Matcher<t.TemplateElement> {
  return new TemplateElementMatcher(value, tail);
}

export class TemplateLiteralMatcher extends Matcher<t.TemplateLiteral> {
  constructor(
    private readonly quasis?:
      | Matcher<Array<t.TemplateElement>>
      | Array<Matcher<t.TemplateElement>>,
    private readonly expressions?:
      | Matcher<Array<t.Expression>>
      | Array<Matcher<t.Expression>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TemplateLiteral {
    if (!isNode(node) || !t.isTemplateLiteral(node)) {
      return false;
    }

    if (typeof this.quasis === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.quasis)) {
      if (
        !tupleOf<unknown>(...this.quasis).matchValue(node.quasis, [
          ...keys,
          'quasis'
        ])
      ) {
        return false;
      }
    } else if (!this.quasis.matchValue(node.quasis, [...keys, 'quasis'])) {
      return false;
    }

    if (typeof this.expressions === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.expressions)) {
      if (
        !tupleOf<unknown>(...this.expressions).matchValue(node.expressions, [
          ...keys,
          'expressions'
        ])
      ) {
        return false;
      }
    } else if (
      !this.expressions.matchValue(node.expressions, [...keys, 'expressions'])
    ) {
      return false;
    }

    return true;
  }
}

export function templateLiteral(
  quasis?:
    | Matcher<Array<t.TemplateElement>>
    | Array<Matcher<t.TemplateElement>>,
  expressions?: Matcher<Array<t.Expression>> | Array<Matcher<t.Expression>>
): Matcher<t.TemplateLiteral> {
  return new TemplateLiteralMatcher(quasis, expressions);
}

export class ThisExpressionMatcher extends Matcher<t.ThisExpression> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ThisExpression {
    if (!isNode(node) || !t.isThisExpression(node)) {
      return false;
    }

    return true;
  }
}

export function thisExpression(): Matcher<t.ThisExpression> {
  return new ThisExpressionMatcher();
}

export class ThisTypeAnnotationMatcher extends Matcher<t.ThisTypeAnnotation> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ThisTypeAnnotation {
    if (!isNode(node) || !t.isThisTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function thisTypeAnnotation(): Matcher<t.ThisTypeAnnotation> {
  return new ThisTypeAnnotationMatcher();
}

export class ThrowStatementMatcher extends Matcher<t.ThrowStatement> {
  constructor(private readonly argument?: Matcher<t.Expression>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.ThrowStatement {
    if (!isNode(node) || !t.isThrowStatement(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function throwStatement(
  argument?: Matcher<t.Expression>
): Matcher<t.ThrowStatement> {
  return new ThrowStatementMatcher(argument);
}

export class TryStatementMatcher extends Matcher<t.TryStatement> {
  constructor(
    private readonly block?: Matcher<t.BlockStatement>,
    private readonly handler?: Matcher<t.CatchClause> | null,
    private readonly finalizer?: Matcher<t.BlockStatement> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TryStatement {
    if (!isNode(node) || !t.isTryStatement(node)) {
      return false;
    }

    if (typeof this.block === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.block.matchValue(node.block, [...keys, 'block'])) {
      return false;
    }

    if (typeof this.handler === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.handler === null) {
      // null matcher means we expect null value
      if (node.handler !== null) {
        return false;
      }
    } else if (node.handler === null) {
      return false;
    } else if (!this.handler.matchValue(node.handler, [...keys, 'handler'])) {
      return false;
    }

    if (typeof this.finalizer === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.finalizer === null) {
      // null matcher means we expect null value
      if (node.finalizer !== null) {
        return false;
      }
    } else if (node.finalizer === null) {
      return false;
    } else if (
      !this.finalizer.matchValue(node.finalizer, [...keys, 'finalizer'])
    ) {
      return false;
    }

    return true;
  }
}

export function tryStatement(
  block?: Matcher<t.BlockStatement>,
  handler?: Matcher<t.CatchClause> | null,
  finalizer?: Matcher<t.BlockStatement> | null
): Matcher<t.TryStatement> {
  return new TryStatementMatcher(block, handler, finalizer);
}

export class TupleTypeAnnotationMatcher extends Matcher<t.TupleTypeAnnotation> {
  constructor(
    private readonly types?:
      | Matcher<Array<t.FlowType>>
      | Array<Matcher<t.FlowType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TupleTypeAnnotation {
    if (!isNode(node) || !t.isTupleTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.types === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.types)) {
      if (
        !tupleOf<unknown>(...this.types).matchValue(node.types, [
          ...keys,
          'types'
        ])
      ) {
        return false;
      }
    } else if (!this.types.matchValue(node.types, [...keys, 'types'])) {
      return false;
    }

    return true;
  }
}

export function tupleTypeAnnotation(
  types?: Matcher<Array<t.FlowType>> | Array<Matcher<t.FlowType>>
): Matcher<t.TupleTypeAnnotation> {
  return new TupleTypeAnnotationMatcher(types);
}

export class TypeAliasMatcher extends Matcher<t.TypeAlias> {
  constructor(
    private readonly id?: Matcher<t.Identifier>,
    private readonly typeParameters?: Matcher<
      t.TypeParameterDeclaration
    > | null,
    private readonly right?: Matcher<t.FlowType>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeAlias {
    if (!isNode(node) || !t.isTypeAlias(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.typeParameters === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.typeParameters === null) {
      // null matcher means we expect null value
      if (node.typeParameters !== null) {
        return false;
      }
    } else if (node.typeParameters === null) {
      return false;
    } else if (
      !this.typeParameters.matchValue(node.typeParameters, [
        ...keys,
        'typeParameters'
      ])
    ) {
      return false;
    }

    if (typeof this.right === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.right.matchValue(node.right, [...keys, 'right'])) {
      return false;
    }

    return true;
  }
}

export function typeAlias(
  id?: Matcher<t.Identifier>,
  typeParameters?: Matcher<t.TypeParameterDeclaration> | null,
  right?: Matcher<t.FlowType>
): Matcher<t.TypeAlias> {
  return new TypeAliasMatcher(id, typeParameters, right);
}

export class TypeAnnotationMatcher extends Matcher<t.TypeAnnotation> {
  constructor(private readonly typeAnnotation?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeAnnotation {
    if (!isNode(node) || !t.isTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function typeAnnotation(
  typeAnnotation?: Matcher<t.FlowType>
): Matcher<t.TypeAnnotation> {
  return new TypeAnnotationMatcher(typeAnnotation);
}

export class TypeCastExpressionMatcher extends Matcher<t.TypeCastExpression> {
  constructor(
    private readonly expression?: Matcher<t.Expression>,
    private readonly typeAnnotation?: Matcher<t.TypeAnnotation>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeCastExpression {
    if (!isNode(node) || !t.isTypeCastExpression(node)) {
      return false;
    }

    if (typeof this.expression === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.expression.matchValue(node.expression, [...keys, 'expression'])
    ) {
      return false;
    }

    if (typeof this.typeAnnotation === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.typeAnnotation.matchValue(node.typeAnnotation, [
        ...keys,
        'typeAnnotation'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function typeCastExpression(
  expression?: Matcher<t.Expression>,
  typeAnnotation?: Matcher<t.TypeAnnotation>
): Matcher<t.TypeCastExpression> {
  return new TypeCastExpressionMatcher(expression, typeAnnotation);
}

export class TypeParameterMatcher extends Matcher<t.TypeParameter> {
  constructor(
    private readonly bound?: Matcher<t.TypeAnnotation> | null,
    private readonly _default?: Matcher<t.FlowType> | null,
    private readonly variance?: Matcher<t.Variance> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeParameter {
    if (!isNode(node) || !t.isTypeParameter(node)) {
      return false;
    }

    if (typeof this.bound === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.bound === null) {
      // null matcher means we expect null value
      if (node.bound !== null) {
        return false;
      }
    } else if (node.bound === null) {
      return false;
    } else if (!this.bound.matchValue(node.bound, [...keys, 'bound'])) {
      return false;
    }

    if (typeof this._default === 'undefined') {
      // undefined matcher means anything matches
    } else if (this._default === null) {
      // null matcher means we expect null value
      if (node.default !== null) {
        return false;
      }
    } else if (node.default === null) {
      return false;
    } else if (!this._default.matchValue(node.default, [...keys, 'default'])) {
      return false;
    }

    if (typeof this.variance === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.variance === null) {
      // null matcher means we expect null value
      if (node.variance !== null) {
        return false;
      }
    } else if (node.variance === null) {
      return false;
    } else if (
      !this.variance.matchValue(node.variance, [...keys, 'variance'])
    ) {
      return false;
    }

    return true;
  }
}

export function typeParameter(
  bound?: Matcher<t.TypeAnnotation> | null,
  _default?: Matcher<t.FlowType> | null,
  variance?: Matcher<t.Variance> | null
): Matcher<t.TypeParameter> {
  return new TypeParameterMatcher(bound, _default, variance);
}

export class TypeParameterDeclarationMatcher extends Matcher<
  t.TypeParameterDeclaration
> {
  constructor(
    private readonly params?:
      | Matcher<Array<t.TypeParameter>>
      | Array<Matcher<t.TypeParameter>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeParameterDeclaration {
    if (!isNode(node) || !t.isTypeParameterDeclaration(node)) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    return true;
  }
}

export function typeParameterDeclaration(
  params?: Matcher<Array<t.TypeParameter>> | Array<Matcher<t.TypeParameter>>
): Matcher<t.TypeParameterDeclaration> {
  return new TypeParameterDeclarationMatcher(params);
}

export class TypeParameterInstantiationMatcher extends Matcher<
  t.TypeParameterInstantiation
> {
  constructor(
    private readonly params?:
      | Matcher<Array<t.FlowType>>
      | Array<Matcher<t.FlowType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeParameterInstantiation {
    if (!isNode(node) || !t.isTypeParameterInstantiation(node)) {
      return false;
    }

    if (typeof this.params === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.params)) {
      if (
        !tupleOf<unknown>(...this.params).matchValue(node.params, [
          ...keys,
          'params'
        ])
      ) {
        return false;
      }
    } else if (!this.params.matchValue(node.params, [...keys, 'params'])) {
      return false;
    }

    return true;
  }
}

export function typeParameterInstantiation(
  params?: Matcher<Array<t.FlowType>> | Array<Matcher<t.FlowType>>
): Matcher<t.TypeParameterInstantiation> {
  return new TypeParameterInstantiationMatcher(params);
}

export class TypeofTypeAnnotationMatcher extends Matcher<
  t.TypeofTypeAnnotation
> {
  constructor(private readonly argument?: Matcher<t.FlowType>) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.TypeofTypeAnnotation {
    if (!isNode(node) || !t.isTypeofTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    return true;
  }
}

export function typeofTypeAnnotation(
  argument?: Matcher<t.FlowType>
): Matcher<t.TypeofTypeAnnotation> {
  return new TypeofTypeAnnotationMatcher(argument);
}

export class UnaryExpressionMatcher extends Matcher<t.UnaryExpression> {
  constructor(
    private readonly operator?:
      | Matcher<'void' | 'throw' | 'delete' | '!' | '+' | '-' | '~' | 'typeof'>
      | string,
    private readonly argument?: Matcher<t.Expression>,
    private readonly prefix?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.UnaryExpression {
    if (!isNode(node) || !t.isUnaryExpression(node)) {
      return false;
    }

    if (typeof this.operator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.operator === 'string') {
      if (this.operator !== node.operator) {
        return false;
      }
    } else if (
      !this.operator.matchValue(node.operator, [...keys, 'operator'])
    ) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    if (typeof this.prefix === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.prefix === 'boolean') {
      if (this.prefix !== node.prefix) {
        return false;
      }
    } else if (!this.prefix.matchValue(node.prefix, [...keys, 'prefix'])) {
      return false;
    }

    return true;
  }
}

export function unaryExpression(
  operator?:
    | Matcher<'void' | 'throw' | 'delete' | '!' | '+' | '-' | '~' | 'typeof'>
    | string,
  argument?: Matcher<t.Expression>,
  prefix?: Matcher<boolean> | boolean
): Matcher<t.UnaryExpression> {
  return new UnaryExpressionMatcher(operator, argument, prefix);
}

export class UnionTypeAnnotationMatcher extends Matcher<t.UnionTypeAnnotation> {
  constructor(
    private readonly types?:
      | Matcher<Array<t.FlowType>>
      | Array<Matcher<t.FlowType>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.UnionTypeAnnotation {
    if (!isNode(node) || !t.isUnionTypeAnnotation(node)) {
      return false;
    }

    if (typeof this.types === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.types)) {
      if (
        !tupleOf<unknown>(...this.types).matchValue(node.types, [
          ...keys,
          'types'
        ])
      ) {
        return false;
      }
    } else if (!this.types.matchValue(node.types, [...keys, 'types'])) {
      return false;
    }

    return true;
  }
}

export function unionTypeAnnotation(
  types?: Matcher<Array<t.FlowType>> | Array<Matcher<t.FlowType>>
): Matcher<t.UnionTypeAnnotation> {
  return new UnionTypeAnnotationMatcher(types);
}

export class UpdateExpressionMatcher extends Matcher<t.UpdateExpression> {
  constructor(
    private readonly operator?: Matcher<'++' | '--'> | string,
    private readonly argument?: Matcher<t.Expression>,
    private readonly prefix?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.UpdateExpression {
    if (!isNode(node) || !t.isUpdateExpression(node)) {
      return false;
    }

    if (typeof this.operator === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.operator === 'string') {
      if (this.operator !== node.operator) {
        return false;
      }
    } else if (
      !this.operator.matchValue(node.operator, [...keys, 'operator'])
    ) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    if (typeof this.prefix === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.prefix === 'boolean') {
      if (this.prefix !== node.prefix) {
        return false;
      }
    } else if (!this.prefix.matchValue(node.prefix, [...keys, 'prefix'])) {
      return false;
    }

    return true;
  }
}

export function updateExpression(
  operator?: Matcher<'++' | '--'> | string,
  argument?: Matcher<t.Expression>,
  prefix?: Matcher<boolean> | boolean
): Matcher<t.UpdateExpression> {
  return new UpdateExpressionMatcher(operator, argument, prefix);
}

export class V8IntrinsicIdentifierMatcher extends Matcher<
  t.V8IntrinsicIdentifier
> {
  constructor(private readonly name?: Matcher<string> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.V8IntrinsicIdentifier {
    if (!isNode(node) || !t.isV8IntrinsicIdentifier(node)) {
      return false;
    }

    if (typeof this.name === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.name === 'string') {
      if (this.name !== node.name) {
        return false;
      }
    } else if (!this.name.matchValue(node.name, [...keys, 'name'])) {
      return false;
    }

    return true;
  }
}

export function v8IntrinsicIdentifier(
  name?: Matcher<string> | string
): Matcher<t.V8IntrinsicIdentifier> {
  return new V8IntrinsicIdentifierMatcher(name);
}

export class VariableDeclarationMatcher extends Matcher<t.VariableDeclaration> {
  constructor(
    private readonly kind?: Matcher<'var' | 'let' | 'const'> | string,
    private readonly declarations?:
      | Matcher<Array<t.VariableDeclarator>>
      | Array<Matcher<t.VariableDeclarator>>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.VariableDeclaration {
    if (!isNode(node) || !t.isVariableDeclaration(node)) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    if (typeof this.declarations === 'undefined') {
      // undefined matcher means anything matches
    } else if (Array.isArray(this.declarations)) {
      if (
        !tupleOf<unknown>(...this.declarations).matchValue(node.declarations, [
          ...keys,
          'declarations'
        ])
      ) {
        return false;
      }
    } else if (
      !this.declarations.matchValue(node.declarations, [
        ...keys,
        'declarations'
      ])
    ) {
      return false;
    }

    return true;
  }
}

export function variableDeclaration(
  kind?: Matcher<'var' | 'let' | 'const'> | string,
  declarations?:
    | Matcher<Array<t.VariableDeclarator>>
    | Array<Matcher<t.VariableDeclarator>>
): Matcher<t.VariableDeclaration> {
  return new VariableDeclarationMatcher(kind, declarations);
}

export class VariableDeclaratorMatcher extends Matcher<t.VariableDeclarator> {
  constructor(
    private readonly id?: Matcher<t.LVal>,
    private readonly init?: Matcher<t.Expression> | null
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.VariableDeclarator {
    if (!isNode(node) || !t.isVariableDeclarator(node)) {
      return false;
    }

    if (typeof this.id === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.id.matchValue(node.id, [...keys, 'id'])) {
      return false;
    }

    if (typeof this.init === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.init === null) {
      // null matcher means we expect null value
      if (node.init !== null) {
        return false;
      }
    } else if (node.init === null) {
      return false;
    } else if (!this.init.matchValue(node.init, [...keys, 'init'])) {
      return false;
    }

    return true;
  }
}

export function variableDeclarator(
  id?: Matcher<t.LVal>,
  init?: Matcher<t.Expression> | null
): Matcher<t.VariableDeclarator> {
  return new VariableDeclaratorMatcher(id, init);
}

export class VarianceMatcher extends Matcher<t.Variance> {
  constructor(private readonly kind?: Matcher<'minus' | 'plus'> | string) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.Variance {
    if (!isNode(node) || !t.isVariance(node)) {
      return false;
    }

    if (typeof this.kind === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.kind === 'string') {
      if (this.kind !== node.kind) {
        return false;
      }
    } else if (!this.kind.matchValue(node.kind, [...keys, 'kind'])) {
      return false;
    }

    return true;
  }
}

export function variance(
  kind?: Matcher<'minus' | 'plus'> | string
): Matcher<t.Variance> {
  return new VarianceMatcher(kind);
}

export class VoidTypeAnnotationMatcher extends Matcher<t.VoidTypeAnnotation> {
  constructor() {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.VoidTypeAnnotation {
    if (!isNode(node) || !t.isVoidTypeAnnotation(node)) {
      return false;
    }

    return true;
  }
}

export function voidTypeAnnotation(): Matcher<t.VoidTypeAnnotation> {
  return new VoidTypeAnnotationMatcher();
}

export class WhileStatementMatcher extends Matcher<t.WhileStatement> {
  constructor(
    private readonly test?: Matcher<t.Expression>,
    private readonly body?: Matcher<t.BlockStatement | t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.WhileStatement {
    if (!isNode(node) || !t.isWhileStatement(node)) {
      return false;
    }

    if (typeof this.test === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.test.matchValue(node.test, [...keys, 'test'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function whileStatement(
  test?: Matcher<t.Expression>,
  body?: Matcher<t.BlockStatement | t.Statement>
): Matcher<t.WhileStatement> {
  return new WhileStatementMatcher(test, body);
}

export class WithStatementMatcher extends Matcher<t.WithStatement> {
  constructor(
    private readonly object?: Matcher<t.Expression>,
    private readonly body?: Matcher<t.BlockStatement | t.Statement>
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.WithStatement {
    if (!isNode(node) || !t.isWithStatement(node)) {
      return false;
    }

    if (typeof this.object === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.object.matchValue(node.object, [...keys, 'object'])) {
      return false;
    }

    if (typeof this.body === 'undefined') {
      // undefined matcher means anything matches
    } else if (!this.body.matchValue(node.body, [...keys, 'body'])) {
      return false;
    }

    return true;
  }
}

export function withStatement(
  object?: Matcher<t.Expression>,
  body?: Matcher<t.BlockStatement | t.Statement>
): Matcher<t.WithStatement> {
  return new WithStatementMatcher(object, body);
}

export class YieldExpressionMatcher extends Matcher<t.YieldExpression> {
  constructor(
    private readonly argument?: Matcher<t.Expression> | null,
    private readonly delegate?: Matcher<boolean> | boolean
  ) {
    super();
  }

  matchValue(
    node: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): node is t.YieldExpression {
    if (!isNode(node) || !t.isYieldExpression(node)) {
      return false;
    }

    if (typeof this.argument === 'undefined') {
      // undefined matcher means anything matches
    } else if (this.argument === null) {
      // null matcher means we expect null value
      if (node.argument !== null) {
        return false;
      }
    } else if (node.argument === null) {
      return false;
    } else if (
      !this.argument.matchValue(node.argument, [...keys, 'argument'])
    ) {
      return false;
    }

    if (typeof this.delegate === 'undefined') {
      // undefined matcher means anything matches
    } else if (typeof this.delegate === 'boolean') {
      if (this.delegate !== node.delegate) {
        return false;
      }
    } else if (
      !this.delegate.matchValue(node.delegate, [...keys, 'delegate'])
    ) {
      return false;
    }

    return true;
  }
}

export function yieldExpression(
  argument?: Matcher<t.Expression> | null,
  delegate?: Matcher<boolean> | boolean
): Matcher<t.YieldExpression> {
  return new YieldExpressionMatcher(argument, delegate);
}
