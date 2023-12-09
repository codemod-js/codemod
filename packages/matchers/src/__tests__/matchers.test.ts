import { js, t } from '@codemod/utils'
import * as m from '../matchers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function expectType<T>(value: T): void {
  // nothing to do
}

test('anyString matches strings', () => {
  expect(m.anyString().match('')).toBeTruthy()
  expect(m.anyString().match('abc')).toBeTruthy()
  expect(m.anyString().match('hi\nthere')).toBeTruthy()
  expect(m.anyString().match(new String('even this'))).toBeTruthy()

  expect(m.anyString().match(0)).toBeFalsy()
  expect(m.anyString().match(null)).toBeFalsy()
  expect(m.anyString().match(undefined)).toBeFalsy()
  expect(m.anyString().match([])).toBeFalsy()
  expect(m.anyString().match({})).toBeFalsy()

  // verify `match` acts as a type assertion
  const value: unknown = undefined
  if (m.anyString().match(value)) {
    ;() => value.toLowerCase()
  }
})

test('anyNumber matches numbers', () => {
  expect(m.anyNumber().match(0)).toBeTruthy()
  expect(m.anyNumber().match(NaN)).toBeTruthy()
  expect(m.anyNumber().match(new Number(1))).toBeTruthy()
  expect(m.anyNumber().match(Infinity)).toBeTruthy()
  expect(m.anyNumber().match(Number.MAX_VALUE)).toBeTruthy()

  expect(m.anyNumber().match('string!?')).toBeFalsy()
  expect(m.anyNumber().match(null)).toBeFalsy()
  expect(m.anyNumber().match(undefined)).toBeFalsy()
  expect(m.anyNumber().match([])).toBeFalsy()
  expect(m.anyNumber().match({})).toBeFalsy()

  // verify `match` acts as a type assertion
  const value: unknown = undefined
  if (m.anyNumber().match(value)) {
    ;() => value.toFixed()
  }
})

test('anything matches everything', () => {
  expect(m.anything().match(0)).toBeTruthy()
  expect(m.anything().match('')).toBeTruthy()
  expect(m.anything().match([])).toBeTruthy()
  expect(m.anything().match({})).toBeTruthy()
  expect(m.anything().match(Number)).toBeTruthy()
  expect(m.anything().match(null)).toBeTruthy()
  expect(m.anything().match(undefined)).toBeTruthy()

  // verify `match` acts as a type assertion
  const value: unknown = undefined
  if (m.anything<number>().match(value)) {
    ;() => value.toFixed()
  }
})

test('arrayOf matches a variable-length homogenous array', () => {
  expect(m.arrayOf(m.anyString()).match([])).toBeTruthy()
  expect(m.arrayOf(m.anyString()).match(['a', 'b'])).toBeTruthy()
  expect(m.arrayOf(m.arrayOf(m.anyString())).match([[], ['a']])).toBeTruthy()

  expect(m.arrayOf(m.anyString()).match(['a', 1])).toBeFalsy()
  expect(m.arrayOf(m.anyString()).match([0, 1])).toBeFalsy()

  expect(m.arrayOf(m.anything()).match(null)).toBeFalsy()
  expect(m.arrayOf(m.anything()).match(undefined)).toBeFalsy()
  expect(m.arrayOf(m.anything()).match({})).toBeFalsy()
  expect(m.arrayOf(m.anything()).match(Number)).toBeFalsy()

  // verify `match` acts as a type assertion
  const value: unknown = undefined
  if (m.arrayOf(m.anyString()).match(value)) {
    ;() => value.push('element')
  }
})

test('tupleOf matches a fixed-length array', () => {
  const stringNumberAnything = m.tupleOf<unknown>(
    m.anyString(),
    m.anyNumber(),
    m.anything(),
  )

  // happy path
  expect(stringNumberAnything.match(['a', 1, {}])).toBeTruthy()

  // out of order matchers
  expect(stringNumberAnything.match([1, '', {}])).toBeFalsy()

  // too few elements
  expect(stringNumberAnything.match([])).toBeFalsy()

  // too many elements
  expect(stringNumberAnything.match(['a', 1, {}, []])).toBeFalsy()

  // verify `match` acts as a type assertion
  const value: unknown = undefined
  if (stringNumberAnything.match(value)) {
    ;() => value.length
  }
})

test('oneOf matches a single-element array', () => {
  expect(m.oneOf(m.anyString()).match([''])).toBeTruthy()
  expect(m.oneOf(m.anything()).match([{}])).toBeTruthy()

  expect(m.oneOf(m.anyString()).match(['', ''])).toBeFalsy()
  expect(m.oneOf(m.anyString()).match([0])).toBeFalsy()
  expect(m.oneOf(m.anyString()).match([])).toBeFalsy()
})

test('anyNode matches any known AST node type', () => {
  expect(m.anyNode().match(t.identifier('abc'))).toBeTruthy()
  expect(m.anyNode().match(t.blockStatement([]))).toBeTruthy()

  expect(m.anyNode().match('Identifier')).toBeFalsy()
  expect(m.anyNode().match(0)).toBeFalsy()
  expect(m.anyNode().match({})).toBeFalsy()
  expect(m.anyNode().match({ type: 'not a known type' })).toBeFalsy()
  expect(m.anyNode().match(null)).toBeFalsy()
  expect(m.anyNode().match(undefined)).toBeFalsy()
})

test('anyExpression matches any known AST expression node type', () => {
  expect(m.anyExpression().match(t.identifier('abc'))).toBeTruthy()
  expect(
    m
      .anyExpression()
      .match(t.functionExpression(null, [], t.blockStatement([]))),
  ).toBeTruthy()

  expect(m.anyExpression().match(t.file(t.program([]), [], []))).toBeFalsy()
  expect(m.anyExpression().match(t.blockStatement([]))).toBeFalsy()
  expect(m.anyExpression().match(t.emptyStatement())).toBeFalsy()
  expect(m.anyExpression().match(t.returnStatement())).toBeFalsy()
  expect(m.anyExpression().match(t.blockStatement([]))).toBeFalsy()
})

test('anyStatement matches any known AST statement node type', () => {
  expect(m.anyStatement().match(t.emptyStatement())).toBeTruthy()
  expect(m.anyStatement().match(t.returnStatement())).toBeTruthy()
  expect(m.anyStatement().match(t.blockStatement([]))).toBeTruthy()

  expect(m.anyStatement().match(t.thisExpression())).toBeFalsy()
  expect(m.anyStatement().match(t.program([]))).toBeFalsy()
  expect(m.anyStatement().match(t.file(t.program([]), [], []))).toBeFalsy()
  expect(m.anyStatement().match(t.program([]))).toBeFalsy()
})

test('m.function( matches any known function node type', () => {
  expect(
    m.function().match(t.functionDeclaration(null, [], t.blockStatement([]))),
  ).toBeTruthy()
  expect(
    m.function().match(t.functionExpression(null, [], t.blockStatement([]))),
  ).toBeTruthy()
  expect(
    m.function().match(t.arrowFunctionExpression([], t.blockStatement([]))),
  ).toBeTruthy()

  expect(m.function().match(t.thisExpression())).toBeFalsy()
  expect(m.function().match(t.blockStatement([]))).toBeFalsy()
})

test('anyList reduces to tupleOf without any slices', () => {
  expect(m.anyList().match([])).toBeTruthy()
  expect(
    m.anyList<number | string>(m.anyString(), m.anyNumber()).match(['', 0]),
  ).toBeTruthy()
})

test('anyList with a fixed-width leading slice', () => {
  const list = m.anyList(m.slice(1), m.anyString())
  expect(list.match([''])).toBeFalsy()
  expect(list.match([{}, ''])).toBeTruthy()
  expect(list.match([{}, {}, ''])).toBeFalsy()
})

test('anyList with slices with specific matchers', () => {
  const list = m.anyList<number | string>(
    m.slice({ min: 1, max: 2, matcher: m.anyNumber() }),
    m.anyString(),
  )
  expect(list.match([''])).toBeFalsy()
  expect(list.match([0, ''])).toBeTruthy()
  expect(list.match([0, 0, ''])).toBeTruthy()
  expect(list.match([0, '', ''])).toBeFalsy()

  const matcher = m.anyList<string | number>(
    m.anyString(),
    m.oneOrMore(m.anyNumber()),
    m.anyString(),
  )
  expect(matcher.match(['', 1, 1, ''])).toBeTruthy()
  expect(matcher.match(['', 1, null, ''])).toBeFalsy()
})

test('anyList with a variable-width leading slice', () => {
  const list = m.anyList(m.slice({ min: 0, max: 1 }), m.anyString())
  expect(list.match([''])).toBeTruthy()
  expect(list.match([{}, ''])).toBeTruthy()
  expect(list.match([{}, {}, ''])).toBeFalsy()
})

test('anyList with a zero-width leading slice', () => {
  const list = m.anyList(m.slice(0), m.anyString())
  expect(list.match([''])).toBeTruthy()
  expect(list.match([{}, ''])).toBeFalsy()
  expect(list.match([{}, {}, ''])).toBeFalsy()
})

test('anyList with a fixed-width trailing slice', () => {
  const list = m.anyList(m.anyString(), m.slice(1))
  expect(list.match([''])).toBeFalsy()
  expect(list.match(['', ''])).toBeTruthy()
  expect(list.match(['', '', ''])).toBeFalsy()
})

test('anyList with multiple fixed slices', () => {
  const list = m.anyList<number | string>(
    m.slice(1),
    m.anyString(),
    m.slice(1),
    m.anyNumber(),
    m.slice(1),
  )
  expect(list.match([])).toBeFalsy()
  expect(list.match([1, '', 2, 3, ''])).toBeTruthy()
  expect(list.match([1, {}, 2, 3, ''])).toBeFalsy()
})

test('anyList with multiple dynamic slices', () => {
  const list = m.anyList<t.Statement>(
    m.zeroOrMore(),
    m.returnStatement(),
    m.oneOrMore(),
  )
  expect(list.match(js('return;').program.body)).toBeFalsy()
  expect(list.match(js('return; foo();').program.body)).toBeTruthy()
})

test('or matches one of the values', () => {
  const mString = m.or(m.anyString())
  const mStringOrNumber = m.or(m.anyString(), m.anyNumber())
  const mStringOrNumberOrNull = m.or(m.anyString(), m.anyNumber(), null)
  expectType<m.Matcher<string>>(mString)
  expectType<m.Matcher<string | number>>(mStringOrNumber)
  expectType<m.Matcher<string | number | null>>(mStringOrNumberOrNull)

  expect(m.or().match(undefined)).toBeFalsy()
  expect(mString.match('')).toBeTruthy()
  expect(mStringOrNumber.match(1)).toBeTruthy()
  expect(mStringOrNumber.match('')).toBeTruthy()
  expect(mStringOrNumberOrNull.match(null)).toBeTruthy()
  expect(mStringOrNumber.match({})).toBeFalsy()
})

test('or matches literal values', () => {
  const m1 = m.or(1)
  const m1or2 = m.or(1, 2)
  expectType<m.Matcher<number>>(m1)
  expectType<m.Matcher<number>>(m1or2)

  expect(m1.match(1)).toBeTruthy()
  expect(m1or2.match(1)).toBeTruthy()
  expect(m1or2.match(2)).toBeTruthy()
  expect(m1or2.match(3)).toBeFalsy()
  expect(m1or2.match({})).toBeFalsy()
})

test('or matches mixed literal values and matchers', () => {
  expect(m.or(1, m.anyString()).match(1)).toBeTruthy()
  expect(m.or(1, m.anyString()).match('')).toBeTruthy()
  expect(m.or(1, m.anyString()).match({})).toBeFalsy()
})

test('containerOf recurses to find a node matching the pattern', () => {
  expect(
    m
      .containerOf(m.binaryExpression('+', m.identifier(), m.numericLiteral()))
      .match(js('return a + 1')),
  ).toBeTruthy()
  expect(
    m.containerOf(m.numericLiteral()).match(js('return a + 1')),
  ).toBeTruthy()
  expect(
    m.containerOf(m.numericLiteral()).match(js('return a + b')),
  ).toBeFalsy()
})

test('containerOf captures the first matching value', () => {
  const plusMatcher = m.containerOf(m.binaryExpression('+'))

  expect(plusMatcher.match(js('console.log(a + b + c);'))).toBeTruthy()
  expect({
    currentKeys: plusMatcher.currentKeys,
    current: plusMatcher.current,
  }).toEqual({
    currentKeys: ['program', 'body', 0, 'expression', 'arguments', 0],
    current: t.binaryExpression(
      '+',
      t.binaryExpression('+', t.identifier('a'), t.identifier('b')),
      t.identifier('c'),
    ),
  })
})

test('containerOf can be used in a nested matcher', () => {
  expect(
    m
      .containerOf(
        m.functionDeclaration(
          m.anything(),
          m.anything(),
          m.containerOf(m.thisExpression()),
        ),
      )
      .match(js('function returnThis() { return this; }')),
  ).toBeTruthy()
})

test('matcher builds a matcher based on a predicate', () => {
  const matcher = m.matcher(
    (value) => typeof value === 'string' && value.startsWith('no'),
  )

  expect(matcher.match('no')).toBeTruthy()
  expect(matcher.match('nope')).toBeTruthy()
  expect(matcher.match('no way')).toBeTruthy()
  expect(matcher.match('notice')).toBeTruthy()

  expect(matcher.match('')).toBeFalsy()
  expect(matcher.match('another')).toBeFalsy()
  expect(matcher.match({})).toBeFalsy()
  expect(matcher.match(42)).toBeFalsy()
})

test('fromCapture builds a matcher based on a capturing matcher', () => {
  const capture = m.capture(m.identifier())
  const matcher = m.fromCapture(capture)
  const id = t.identifier('a')
  const idEquivalent = t.identifier('a')
  const idUnequivalent = t.identifier('b')

  // matching the capture matcher should capture the value
  expect(capture.current).toBeUndefined()
  expect(capture.match(id)).toBeTruthy()
  expect(capture.current).toBe(id)

  // `fromCapture` uses the captured value to build a matcher
  expect(matcher.match(id)).toBeTruthy()
  expect(matcher.match(idEquivalent)).toBeTruthy()
  expect(matcher.match(idUnequivalent)).toBeFalsy()
  expect(matcher.match(9)).toBeFalsy()
})

test('regression: #921', () => {
  expect(
    m
      .functionExpression(m.anything())
      .match(t.functionExpression(null, [], t.blockStatement([])))
  ).toBeTruthy()
})
