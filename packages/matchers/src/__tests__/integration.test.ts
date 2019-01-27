import * as t from '@babel/types';
import * as m from '../../src/matchers';
import js from './utils/parse/js';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import dedent = require('dedent');
import { BuildExpression as E, BuildStatement as S } from './utils/builders';
import match from '../utils/match';

/**
 * This test demonstrates using captures to extract parts of an AST for use in
 * a codemod that unwraps unnecessary IIFEs. For example:
 *
 * ```js
 * function iifeWithExpression() {
 *   return (() => EXPR);
 * }
 *
 * function iifeWithStatements() {
 *   return (() => {
 *     STMT1;
 *     STMT2;
 *   });
 * }
 *
 * // becomes
 *
 * function iifeWithExpression() {
 *   return EXPR;
 * }
 *
 * function iifeWithStatements() {
 *   STMT1;
 *   STMT2;
 * }
 * ```
 */
test('codemod: unwrap unneeded IIFE', () => {
  const ast = js(dedent`
    function foo() {
      return (() => 1)();
    }
  `);

  let body: m.CapturedMatcher<t.Expression | t.BlockStatement>;

  const returnedIIFEMatcher = m.returnStatement(
    m.callExpression(m.function(
      [],
      (body = m.capture(m.or(m.anyExpression(), m.blockStatement())))
    ) as m.Matcher<t.Expression>)
  );

  traverse(ast, {
    ReturnStatement(path: NodePath<t.ReturnStatement>): void {
      match(returnedIIFEMatcher, { body }, path.node, ({ body }) => {
        if (t.isExpression(body)) {
          path.replaceWith(t.returnStatement(body));
        } else {
          path.replaceWithMultiple(body.body);
        }
      });
    }
  });

  expect(generate(ast).code).toEqual(dedent`
    function foo() {
      return 1;
    }
  `);
});

test('codemod: remove return labels', () => {
  const ast = js(dedent`
    function foo() {
      console.log("calling foo");
      let classlist;
      console.log("about to return");
      return (classlist = classes.join(" "));
    }
  `);
  let labelDeclaration: m.CapturedMatcher<t.VariableDeclaration>;
  let label: m.CapturedMatcher<string>;
  let returnStatement: m.CapturedMatcher<t.ReturnStatement>;
  let value: m.CapturedMatcher<t.Expression>;

  const returnLabelFunctionMatcher = m.function(
    undefined,
    m.blockStatement(
      m.anyList<t.Statement>(
        m.zeroOrMore(),
        (labelDeclaration = m.capture(
          m.variableDeclaration(
            'let',
            m.oneOf(
              m.variableDeclarator(
                m.identifier((label = m.capture(m.anyString()))),
                null
              )
            )
          )
        )),
        m.zeroOrMore(),
        (returnStatement = m.capture(
          m.returnStatement(
            m.assignmentExpression(
              '=',
              m.identifier(m.fromCapture(label)),
              (value = m.capture())
            )
          )
        )),
        m.zeroOrMore()
      )
    )
  );

  function processFunction(path: NodePath<t.Function>): void {
    match(
      returnLabelFunctionMatcher,
      { returnStatement, value, labelDeclaration },
      path.node,
      ({ returnStatement, value, labelDeclaration }) => {
        const bodyPath = path.get('body');
        if (bodyPath.isBlockStatement()) {
          const labelDeclarationPath = bodyPath
            .get('body')
            .find(statementPath => statementPath.node === labelDeclaration);

          if (labelDeclarationPath) {
            labelDeclarationPath.remove();
          }
        }
        returnStatement.argument = value;
      }
    );
  }

  traverse(ast, {
    FunctionDeclaration: processFunction,
    FunctionExpression: processFunction,
    ArrowFunctionExpression: processFunction
  });

  expect(generate(ast).code).toEqual(dedent`
    function foo() {
      console.log("calling foo");
      console.log("about to return");
      return classes.join(" ");
    }
  `);
});

test('codemod: assert to jest expect', () => {
  const ast = js(dedent`
    assert.strictEqual(a, 7);
    assert.deepEqual(b, {});
    assert.ok(c);
    assert.ok(!d);
  `);

  let actual: m.CapturedMatcher<t.Expression>;
  let expected: m.CapturedMatcher<t.Expression>;
  const assertEqualMatcher = m.callExpression(
    m.memberExpression(
      m.identifier('assert'),
      m.identifier(m.or('strictEqual', 'deepEqual'))
    ),
    [
      (actual = m.capture(m.anyExpression())),
      (expected = m.capture(m.anyExpression()))
    ]
  );

  let falsyValue: m.CapturedMatcher<t.Expression>;
  const assertFalsyMatcher = m.callExpression(
    m.memberExpression(m.identifier('assert'), m.identifier('ok')),
    [m.unaryExpression('!', (falsyValue = m.capture(m.anyExpression())))]
  );

  let truthValue: m.CapturedMatcher<t.Expression>;
  const assertTruthyMatcher = m.callExpression(
    m.memberExpression(m.identifier('assert'), m.identifier('ok')),
    [(truthValue = m.capture())]
  );

  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>): void {
      // replace equality assertions
      match(
        assertEqualMatcher,
        { actual, expected },
        path.node,
        ({ actual, expected }) => {
          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.callExpression(t.identifier('expect'), [actual]),
                t.identifier('toEqual')
              ),
              [expected]
            )
          );
        }
      );

      // replace e.g. `assert.ok(!a)` with `expect(a).toBeFalsy()`
      match(assertFalsyMatcher, { falsyValue }, path.node, ({ falsyValue }) => {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.callExpression(t.identifier('expect'), [falsyValue]),
              t.identifier('toBeFalsy')
            ),
            []
          )
        );
      });

      // replace e.g. `assert.ok(a)` with `expect(a).toBeTruthy()`
      match(
        assertTruthyMatcher,
        { truthValue },
        path.node,
        ({ truthValue }) => {
          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.callExpression(t.identifier('expect'), [truthValue]),
                t.identifier('toBeTruthy')
              ),
              []
            )
          );
        }
      );
    }
  });

  expect(generate(ast).code).toEqual(dedent`
    expect(a).toEqual(7);
    expect(b).toEqual({});
    expect(c).toBeTruthy();
    expect(d).toBeFalsy();
  `);
});

test('codemod: double-equal null to triple-equal', () => {
  const ast = js('a == null;');
  const left = m.capture(m.identifier());
  const eqeqNullMatcher = m.binaryExpression('==', left, m.nullLiteral());

  traverse(ast, {
    BinaryExpression(path: NodePath<t.BinaryExpression>): void {
      match(eqeqNullMatcher, { left }, path.node, ({ left }) => {
        path.replaceWith(E`${left} === null || ${left} === undefined`);
      });
    }
  });

  expect(generate(ast).code).toEqual('a === null || a === undefined;');
});

test('codemod: assert.expect to assert.async', () => {
  const ast = js(dedent`
    test("my test", function (assert) {
      assert.expect(1);
      window.server.get("/some/api", () => {
        asyncThing().then(() => {
          assert.ok(true, "API called!");
        });
      });
      doStuff();
    });
  `);

  // capture name of `assert` parameter
  const assertBinding = m.capture(m.anyString());

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
  );

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
  );

  // capture callback function body
  const callbackFunctionBody = m.containerOf(
    m.blockStatement(
      m.anyList(m.zeroOrMore(), callbackAssertion, m.zeroOrMore())
    )
  );

  // capture async test function body
  const asyncTestFunctionBody = m.capture(
    m.blockStatement(
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
                m.functionExpression(
                  undefined,
                  undefined,
                  callbackFunctionBody
                ),
                m.arrowFunctionExpression(undefined, callbackFunctionBody)
              )
            )
          )
        ),
        m.zeroOrMore()
      )
    )
  );

  // match the whole `test('description', function(assert) { … })`
  const asyncTestMatcher = m.callExpression(m.identifier('test'), [
    m.stringLiteral(),
    m.functionExpression(
      undefined,
      [m.identifier(assertBinding)],
      asyncTestFunctionBody
    )
  ]);

  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>): void {
      match(
        asyncTestMatcher,
        {
          asyncTestFunctionBody,
          assertExpect,
          callbackFunctionBody,
          callbackAssertion,
          assertBinding
        },
        path.node,
        ({
          asyncTestFunctionBody,
          assertExpect,
          callbackFunctionBody,
          callbackAssertion,
          assertBinding
        }) => {
          const assertExpectIndex = asyncTestFunctionBody.body.indexOf(
            assertExpect
          );
          const callbackAssertionIndex = callbackFunctionBody.body.indexOf(
            callbackAssertion
          );

          asyncTestFunctionBody.body.splice(
            assertExpectIndex,
            1,
            S`const done = ${t.identifier(assertBinding)}.async();`
          );

          callbackFunctionBody.body.splice(
            callbackAssertionIndex + 1,
            0,
            S`done();`
          );
        }
      );
    }
  });

  expect(generate(ast).code).toEqual(dedent`
    test("my test", function (assert) {
      const done = assert.async();
      window.server.get("/some/api", () => {
        asyncThing().then(() => {
          assert.ok(true, "API called!");
          done();
        });
      });
      doStuff();
    });
  `);
});
