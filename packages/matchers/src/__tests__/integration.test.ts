import * as t from '@babel/types';
import * as m from '../../src';
import js from './utils/parse/js';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import dedent = require('dedent');
import { BuildExpression as E } from './utils/builders';
import match from '../utils/match';
import convertStaticClassToNamedExports from '../../examples/convert-static-class-to-named-exports';
import convertQUnitAssertExpectToAssertAsync from '../../examples/convert-qunit-assert-expect-to-assert-async';
import { transform } from '@codemod/core';

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
  const input = dedent`
    test("my test", function (assert) {
      assert.expect(1);
      window.server.get("/some/api", () => {
        asyncThing().then(() => {
          assert.ok(true, "API called!");
        });
      });
      doStuff();
    });
  `;

  const output = transform(input, {
    plugins: [convertQUnitAssertExpectToAssertAsync()]
  });

  expect(output && output.code).toEqual(dedent`
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

test('codemod: convert static exported class to named exports', () => {
  const code = dedent`
    class MobileAppUpsellHelper {
      static getIosAppLink(specialTrackingLink) {
        const trackingLink = specialTrackingLink || "IOS_BRANCH_LINK";
        return this.getBranchLink(trackingLink);
      }

      static getAndroidAppLink(specialTrackingLink) {
        const trackingLink = specialTrackingLink || "ANDROID_BRANCH_LINK";
        return this.getBranchLink(trackingLink);
      }

      static getBranchLink(specialTrackingLink) {
        if (specialTrackingLink && APP_DOWNLOAD_ASSETS[specialTrackingLink]) {
          return APP_DOWNLOAD_ASSETS[specialTrackingLink];
        }

        return APP_DOWNLOAD_ASSETS.DEFAULT_BRANCH_LINK;
      }

      static getHideAppBanner() {
        return CookieHelper.get("hide_app_banner");
      }
    }

    export default MobileAppUpsellHelper;
  `;

  const output = transform(code, {
    plugins: [convertStaticClassToNamedExports()]
  });

  expect(output && output.code).toEqual(dedent`
    export function getIosAppLink(specialTrackingLink) {
      const trackingLink = specialTrackingLink || "IOS_BRANCH_LINK";
      return getBranchLink(trackingLink);
    }

    export function getAndroidAppLink(specialTrackingLink) {
      const trackingLink = specialTrackingLink || "ANDROID_BRANCH_LINK";
      return getBranchLink(trackingLink);
    }

    export function getBranchLink(specialTrackingLink) {
      if (specialTrackingLink && APP_DOWNLOAD_ASSETS[specialTrackingLink]) {
        return APP_DOWNLOAD_ASSETS[specialTrackingLink];
      }

      return APP_DOWNLOAD_ASSETS.DEFAULT_BRANCH_LINK;
    }

    export function getHideAppBanner() {
      return CookieHelper.get("hide_app_banner");
    }
  `);
});
