import * as m from '../matchers';
import * as t from '@babel/types';
import js from './utils/parse/js';

test('anyString matches strings', () => {
  expect(m.anyString().match('')).toBeTruthy();
  expect(m.anyString().match('abc')).toBeTruthy();
  expect(m.anyString().match('hi\nthere')).toBeTruthy();
  expect(m.anyString().match(new String('even this'))).toBeTruthy();

  expect(m.anyString().match(0)).toBeFalsy();
  expect(m.anyString().match(null)).toBeFalsy();
  expect(m.anyString().match(undefined)).toBeFalsy();
  expect(m.anyString().match([])).toBeFalsy();
  expect(m.anyString().match({})).toBeFalsy();

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anyString().match(value)) {
    () => value.toLowerCase();
  }
});

test('anyNumber matches numbers', () => {
  expect(m.anyNumber().match(0)).toBeTruthy();
  expect(m.anyNumber().match(NaN)).toBeTruthy();
  expect(m.anyNumber().match(new Number(1))).toBeTruthy();
  expect(m.anyNumber().match(Infinity)).toBeTruthy();
  expect(m.anyNumber().match(Number.MAX_VALUE)).toBeTruthy();

  expect(m.anyNumber().match('string!?')).toBeFalsy();
  expect(m.anyNumber().match(null)).toBeFalsy();
  expect(m.anyNumber().match(undefined)).toBeFalsy();
  expect(m.anyNumber().match([])).toBeFalsy();
  expect(m.anyNumber().match({})).toBeFalsy();

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anyNumber().match(value)) {
    () => value.toFixed();
  }
});

test('anything matches everything', () => {
  expect(m.anything().match(0)).toBeTruthy();
  expect(m.anything().match('')).toBeTruthy();
  expect(m.anything().match([])).toBeTruthy();
  expect(m.anything().match({})).toBeTruthy();
  expect(m.anything().match(Number)).toBeTruthy();
  expect(m.anything().match(null)).toBeTruthy();
  expect(m.anything().match(undefined)).toBeTruthy();

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.anything<number>().match(value)) {
    () => value.toFixed();
  }
});

test('arrayOf matches a variable-length homogenous array', () => {
  expect(m.arrayOf(m.anyString()).match([])).toBeTruthy();
  expect(m.arrayOf(m.anyString()).match(['a', 'b'])).toBeTruthy();
  expect(m.arrayOf(m.arrayOf(m.anyString())).match([[], ['a']])).toBeTruthy();

  expect(m.arrayOf(m.anyString()).match(['a', 1])).toBeFalsy();
  expect(m.arrayOf(m.anyString()).match([0, 1])).toBeFalsy();

  expect(m.arrayOf(m.anything()).match(null)).toBeFalsy();
  expect(m.arrayOf(m.anything()).match(undefined)).toBeFalsy();
  expect(m.arrayOf(m.anything()).match({})).toBeFalsy();
  expect(m.arrayOf(m.anything()).match(Number)).toBeFalsy();

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (m.arrayOf(m.anyString()).match(value)) {
    () => value.push('element');
  }
});

test('tupleOf matches a fixed-length array', () => {
  const stringNumberAnything = m.tupleOf<unknown>(
    m.anyString(),
    m.anyNumber(),
    m.anything()
  );

  // happy path
  expect(stringNumberAnything.match(['a', 1, {}])).toBeTruthy();

  // out of order matchers
  expect(stringNumberAnything.match([1, '', {}])).toBeFalsy();

  // too few elements
  expect(stringNumberAnything.match([])).toBeFalsy();

  // too many elements
  expect(stringNumberAnything.match(['a', 1, {}, []])).toBeFalsy();

  // verify `match` acts as a type assertion
  const value: unknown = undefined;
  if (stringNumberAnything.match(value)) {
    () => value.length;
  }
});

test('oneOf matches a single-element array', () => {
  expect(m.oneOf(m.anyString()).match([''])).toBeTruthy();
  expect(m.oneOf(m.anything()).match([{}])).toBeTruthy();

  expect(m.oneOf(m.anyString()).match(['', ''])).toBeFalsy();
  expect(m.oneOf(m.anyString()).match([0])).toBeFalsy();
  expect(m.oneOf(m.anyString()).match([])).toBeFalsy();
});

test('anyNode matches any known AST node type', () => {
  expect(m.anyNode().match(t.identifier('abc'))).toBeTruthy();
  expect(m.anyNode().match(t.program([]))).toBeTruthy();

  expect(m.anyNode().match('Identifier')).toBeFalsy();
  expect(m.anyNode().match(0)).toBeFalsy();
  expect(m.anyNode().match({})).toBeFalsy();
  expect(m.anyNode().match({ type: 'not a known type' })).toBeFalsy();
  expect(m.anyNode().match(null)).toBeFalsy();
  expect(m.anyNode().match(undefined)).toBeFalsy();
});

test('anyExpression matches any known AST expression node type', () => {
  expect(m.anyExpression().match(t.identifier('abc'))).toBeTruthy();
  expect(
    m
      .anyExpression()
      .match(t.functionExpression(null, [], t.blockStatement([])))
  ).toBeTruthy();

  expect(m.anyExpression().match(t.file(t.program([]), [], []))).toBeFalsy();
  expect(m.anyExpression().match(t.program([]))).toBeFalsy();
  expect(m.anyExpression().match(t.emptyStatement())).toBeFalsy();
  expect(m.anyExpression().match(t.returnStatement())).toBeFalsy();
  expect(m.anyExpression().match(t.blockStatement([]))).toBeFalsy();
});

test('anyStatement matches any known AST statement node type', () => {
  expect(m.anyStatement().match(t.emptyStatement())).toBeTruthy();
  expect(m.anyStatement().match(t.returnStatement())).toBeTruthy();
  expect(m.anyStatement().match(t.blockStatement([]))).toBeTruthy();

  expect(m.anyStatement().match(t.thisExpression())).toBeFalsy();
  expect(m.anyStatement().match(t.program([]))).toBeFalsy();
  expect(m.anyStatement().match(t.file(t.program([]), [], []))).toBeFalsy();
  expect(m.anyStatement().match(t.program([]))).toBeFalsy();
});

test('m.function( matches any known function node type', () => {
  expect(
    m.function().match(t.functionDeclaration(null, [], t.blockStatement([])))
  ).toBeTruthy();
  expect(
    m.function().match(t.functionExpression(null, [], t.blockStatement([])))
  ).toBeTruthy();
  expect(
    m.function().match(t.arrowFunctionExpression([], t.blockStatement([])))
  ).toBeTruthy();

  expect(m.function().match(t.thisExpression())).toBeFalsy();
  expect(m.function().match(t.blockStatement([]))).toBeFalsy();
});

test('anyList reduces to tupleOf without any spacers', () => {
  expect(m.anyList().match([])).toBeTruthy();
  expect(
    m.anyList<number | string>(m.anyString(), m.anyNumber()).match(['', 0])
  ).toBeTruthy();
});

test('anyList with a fixed-width leading spacer', () => {
  const list = m.anyList(m.spacer(), m.anyString());
  expect(list.match([''])).toBeFalsy();
  expect(list.match([{}, ''])).toBeTruthy();
  expect(list.match([{}, {}, ''])).toBeFalsy();
});

test('anyList with a variable-width leading spacer', () => {
  const list = m.anyList(m.spacer(0, 1), m.anyString());
  expect(list.match([''])).toBeTruthy();
  expect(list.match([{}, ''])).toBeTruthy();
  expect(list.match([{}, {}, ''])).toBeFalsy();
});

test('anyList with a zero-width leading spacer', () => {
  const list = m.anyList(m.spacer(0), m.anyString());
  expect(list.match([''])).toBeTruthy();
  expect(list.match([{}, ''])).toBeFalsy();
  expect(list.match([{}, {}, ''])).toBeFalsy();
});

test('anyList with a fixed-width trailing spacer', () => {
  const list = m.anyList(m.anyString(), m.spacer());
  expect(list.match([''])).toBeFalsy();
  expect(list.match(['', ''])).toBeTruthy();
  expect(list.match(['', '', ''])).toBeFalsy();
});

test('anyList with multiple fixed spacers', () => {
  const list = m.anyList<number | string>(
    m.spacer(),
    m.anyString(),
    m.spacer(),
    m.anyNumber(),
    m.spacer()
  );
  expect(list.match([])).toBeFalsy();
  expect(list.match([1, '', 2, 3, ''])).toBeTruthy();
  expect(list.match([1, {}, 2, 3, ''])).toBeFalsy();
});

test('anyList with multiple dynamic spacers', () => {
  const list = m.anyList<t.Statement>(
    m.zeroOrMore(),
    m.returnStatement(),
    m.oneOrMore()
  );
  expect(list.match(js('return;').program.body)).toBeFalsy();
  expect(list.match(js('return; foo();').program.body)).toBeTruthy();
});

test('or matches one of the values', () => {
  expect(m.or().match(undefined)).toBeFalsy();
  expect(m.or(m.anyString()).match('')).toBeTruthy();
  expect(m.or(m.anyString(), m.anyNumber()).match(1)).toBeTruthy();
  expect(m.or(m.anyString(), m.anyNumber()).match('')).toBeTruthy();
  expect(m.or(m.anyString(), m.anyNumber(), null).match(null)).toBeTruthy();
  expect(m.or(m.anyString(), m.anyNumber()).match({})).toBeFalsy();
});

test('or matches literal values', () => {
  expect(m.or(1).match(1)).toBeTruthy();
  expect(m.or(1, 2).match(1)).toBeTruthy();
  expect(m.or(1, 2).match(2)).toBeTruthy();
  expect(m.or(1, 2).match(3)).toBeFalsy();
  expect(m.or(1, 2).match({})).toBeFalsy();
});

test('or matches mixed literal values and matchers', () => {
  expect(m.or(1, m.anyString()).match(1)).toBeTruthy();
  expect(m.or(1, m.anyString()).match('')).toBeTruthy();
  expect(m.or(1, m.anyString()).match({})).toBeFalsy();
});

test('containerOf recurses to find a node matching the pattern', () => {
  expect(
    m
      .containerOf(m.binaryExpression('+', m.identifier(), m.numericLiteral()))
      .match(js('return a + 1'))
  ).toBeTruthy();
  expect(
    m.containerOf(m.numericLiteral()).match(js('return a + 1'))
  ).toBeTruthy();
  expect(
    m.containerOf(m.numericLiteral()).match(js('return a + b'))
  ).toBeFalsy();
});

test('containerOf captures the first matching value', () => {
  const plusMatcher = m.containerOf(m.binaryExpression('+'));

  expect(plusMatcher.match(js('console.log(a + b + c);'))).toBeTruthy();
  expect({
    currentKeys: plusMatcher.currentKeys,
    current: plusMatcher.current
  }).toEqual({
    currentKeys: ['program', 'body', 0, 'expression', 'arguments', 0],
    current: t.binaryExpression(
      '+',
      t.binaryExpression('+', t.identifier('a'), t.identifier('b')),
      t.identifier('c')
    )
  });
});

test('containerOf can be used in a nested matcher', () => {
  expect(
    m
      .containerOf(
        m.functionDeclaration(
          m.anything(),
          m.anything(),
          m.containerOf(m.thisExpression())
        )
      )
      .match(js('function returnThis() { return this; }'))
  ).toBeTruthy();
});

test('matcher builds a matcher based on a predicate', () => {
  const matcher = m.matcher(
    value => typeof value === 'string' && value.startsWith('no')
  );

  expect(matcher.match('no')).toBeTruthy();
  expect(matcher.match('nope')).toBeTruthy();
  expect(matcher.match('no way')).toBeTruthy();
  expect(matcher.match('notice')).toBeTruthy();

  expect(matcher.match('')).toBeFalsy();
  expect(matcher.match('another')).toBeFalsy();
  expect(matcher.match({})).toBeFalsy();
  expect(matcher.match(42)).toBeFalsy();
});
