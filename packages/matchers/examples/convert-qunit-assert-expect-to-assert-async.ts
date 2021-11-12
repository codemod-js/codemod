/**
 * Converts deprecated `assert.expect(N)`-style tests to use `assert.async()`.
 *
 * @example
 *
 * test('my test', function (assert) {
 *   assert.expect(1);
 *   window.server.get('/some/api', () => {
 *     asyncThing().then(() => {
 *       assert.ok(true, 'API called!');
 *     });
 *   });
 *   doStuff();
 * });
 *
 * // becomes
 *
 * test('my test', function (assert) {
 *   const done = assert.async();
 *   window.server.get('/some/api', () => {
 *     asyncThing().then(() => {
 *       assert.ok(true, 'API called!');
 *       done();
 *     });
 *   });
 *   doStuff();
 * });
 */

import * as t from '@babel/types'
import * as m from '../src'
import { NodePath, PluginObj } from '@babel/core'
import { statement } from '../src/__tests__/utils/builders'

// capture name of `assert` parameter
const assertBinding = m.capture(m.anyString())

// capture `assert.expect(<number>);` inside the async test
const assertExpect = m.capture(
  m.expressionStatement(
    m.callExpression(
      m.memberExpression(
        m.identifier(m.fromCapture(assertBinding)),
        m.identifier('expect')
      ),
      [m.numericLiteral()]
    )
  )
)

// capture `assert.<method>(…);` inside the callback
const callbackAssertion = m.capture(
  m.expressionStatement(
    m.callExpression(
      m.memberExpression(
        m.identifier(m.fromCapture(assertBinding)),
        m.identifier()
      )
    )
  )
)

// callback function body
const callbackFunctionBody = m.containerOf(
  m.blockStatement(m.anyList(m.zeroOrMore(), callbackAssertion, m.zeroOrMore()))
)

// async test function body
const asyncTestFunctionBody = m.blockStatement(
  m.anyList(
    m.zeroOrMore(),
    assertExpect,
    m.zeroOrMore(),
    m.expressionStatement(
      m.callExpression(
        undefined,
        m.anyList(
          m.zeroOrMore(),
          m.or(
            m.functionExpression(undefined, undefined, callbackFunctionBody),
            m.arrowFunctionExpression(undefined, callbackFunctionBody)
          )
        )
      )
    ),
    m.zeroOrMore()
  )
)

// match the whole `test('description', function(assert) { … })`
const asyncTestMatcher = m.callExpression(m.identifier('test'), [
  m.stringLiteral(),
  m.functionExpression(
    undefined,
    [m.identifier(assertBinding)],
    asyncTestFunctionBody
  ),
])

export default function (): PluginObj {
  const makeDone = statement<{ assert: t.Identifier }>(
    'const done = %%assert%%.async();'
  )
  const callDone = statement('done();')

  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>): void {
        m.matchPath(
          asyncTestMatcher,
          {
            assertExpect,
            callbackAssertion,
            assertBinding,
          },
          path,
          ({ assertExpect, callbackAssertion, assertBinding }) => {
            assertExpect.replaceWith(
              makeDone({ assert: t.identifier(assertBinding) })
            )
            callbackAssertion.insertAfter(callDone())
          }
        )
      },
    },
  }
}
