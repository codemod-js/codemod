# @codemod/matchers

Matchers for JavaScript & TypeScript codemods.

## Install

Install from [npm](https://npmjs.com/):

```sh
$ npm install @codemod/matchers
```

## Usage

> This package is primarily intended to be used by codemods with `@codemod/cli`, but can be used in any Babel plugin or JavaScript/TypeScript AST processor. Note that the examples below are all written in [TypeScript](https://typescriptlang.org/), but in most cases are identical to their JavaScript counterpart.

### Simple Matching

Just as you can build AST nodes with `@babel/types`, you can build AST node matchers to match an exact node with `@codemod/matchers`:

```ts
import * as m from '@codemod/matchers'
import * as t from '@babel/types'

// `matcher` only matches Identifier nodes named 'test'
const matcher = m.identifier('test')

matcher.match(t.identifier('test')) // true
matcher.match(t.identifier('test2')) // false
```

### Fuzzy Matching

Matching exact nodes is not usually what you want, however. `@codemod/matchers` can build matchers where only part of the data is specified:

```ts
import * as m from '@codemod/matchers'
import * as t from '@babel/types'

// `matcher` matches any Identifier, regardless of name
const matcher = m.identifier()

matcher.match(t.identifier('test')) // true
matcher.match(t.identifier('test2')) // true
matcher.match(t.emptyStatement()) // false
```

Here's a more complex example that matches any `console.log` calls. Assume that `expr` parses the given JS as an expression:

```ts
import * as m from '@codemod/matchers'

// `matcher` matches any `console.log(…)` call
const matcher = m.callExpression(
  m.memberExpression(m.identifier('console'), m.identifier('log'), false)
  // `arguments` is omitted to match anything, or we could pass `m.anything()`
)

matcher.match(expr('console.log()')) // true
matcher.match(expr('console.log(1, 2)')) // true
matcher.match(expr('console.log')) // false
```

There are a variety of fuzzy matchers that come with `@codemod/matchers`:

```ts
import * as m from '@codemod/matchers'

m.anyString().match('a string') // true
m.anyString().match(1) // false

m.anyNumber().match(1) // true
m.anyNumber().match('a string') // false

m.anything().match(1) // true
m.anything().match('a string') // true
m.anything().match(expr('foo')) // true
m.anything().match(null) // true

m.anyNode().match(expr('a + b')) // true
m.anyNode().match(expr('!a')) // true
m.anyNode().match(1) // false
m.anyNode().match('a string') // false
```

### Capturing Matches

Often you'll want to capture part of the node that you've matched so that you can extract information from it or edit it.

```ts
import * as m from '@codemod/matchers'

// matches `console.<consoleMethod>(…)` calls
const consoleMethod = m.capture(m.identifier())
const matcher = m.callExpression(
  m.memberExpression(m.identifier('console'), consoleMethod, false)
  // `arguments` is omitted to match anything, or we could pass `m.anything()`
)

if (matcher.match(expr('console.log()'))) {
  console.log(`found console call: ${consoleMethod.current.name}`)
}

if (matcher.match(expr('console.group("hi!")'))) {
  console.log(`found console call: ${consoleMethod.current.name}`)
}

if (matcher.match(expr('notAConsoleCall()'))) {
  console.log(`found console call: ${consoleMethod.current.name}`)
}

// logs:
//   found console call: log
//   found console call: group
```

### Back-referencing Captures

Sometimes you'll want to refer to an earlier captured value in a later part of the matcher. For example, let's say you want to match a function expression which returns its argument:

```ts
import * as m from '@codemod/matchers'

const argumentNameMatcher = m.capture(m.anyString())
const matcher = m.functionExpression(
  m.anything(),
  [m.identifier(argumentNameMatcher)],
  m.blockStatement([
    m.returnStatement(m.fromCapture(m.identifier(argumentNameMatcher))),
  ])
)

matcher.match(expr('function(a) { return a; })')) // true
matcher.match(expr('function id(a) { return a; })')) // true
matcher.match(expr('function(a) { return b; })')) // false
matcher.match(expr('function(a) { return 1; })')) // false
matcher.match(expr('function(a) { return a + a; })')) // false
```

### Use in a Codemod

All the previous examples have matchers testing a specific AST node. This is useful for illustration, but is not typically how you'd use them. Codemods written for `@codemod/cli` are [Babel plugins](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) and therefore use the visitor pattern to process ASTs. Here's the above example that identifies functions that do nothing but return their argument again, this time as a Babel plugin that replaces such functions with a global `IDENTITY` reference:

```ts
/**
 * Replaces identity functions with `IDENTITY`:
 *
 *   list.filter(function(a) { return a; });
 *
 * becomes:
 *
 *   list.filter(IDENTITY);
 */
import * as m from '@codemod/matchers'
import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function () {
  return {
    visitor: {
      FunctionExpression(path: NodePath<t.FunctionExpression>): void {
        const argumentNameMatcher = m.capture(m.anyString())
        const matcher = m.functionExpression(
          m.anything(),
          [m.identifier(argumentNameMatcher)],
          m.blockStatement([
            m.returnStatement(m.fromCapture(m.identifier(argumentNameMatcher))),
          ])
        )

        if (matcher.match(path.node)) {
          path.replaceWith(t.identifier('IDENTITY'))
        }
      },
    },
  }
}
```

Here is the same plugin again without using `@codemod/matchers`:

```ts
/**
 * Replaces identity functions with `IDENTITY`:
 *
 *   list.filter(function(a) { return a; });
 *
 * becomes:
 *
 *   list.filter(IDENTITY);
 */
import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function () {
  return {
    visitor: {
      /**
       * This version of the codemod, which does not use `@codemod/matchers`,
       * is more verbose and more likely to have subtle bugs. For example,
       * it's easy to forget to check that the `return` statement actually has a
       * return value before checking that it is an identifier, which would
       * result in a crash.
       */
      FunctionExpression(path: NodePath<t.FunctionExpression>): void {
        // ensure function has exactly one parameter
        if (path.node.params.length !== 1) {
          return
        }

        // ensure parameter is an identifier
        const param = path.node.params[0]
        if (!t.isIdentifier(param)) {
          return
        }

        // ensure function body has exactly one statement
        if (path.node.body.body.length !== 1) {
          return
        }

        // ensure that statement is a return statement
        const statement = path.node.body.body[0]
        if (!t.isReturnStatement(statement)) {
          return
        }

        // ensure the return actually returns something, an identifier
        if (!statement.argument || !t.isIdentifier(statement.argument)) {
          return
        }

        // ensure returned identifier has same name as the param
        if (statement.argument.name !== param.name) {
          return
        }

        // replace!
        path.replaceWith(t.identifier('IDENTITY'))
      },
    },
  }
}
```

### Deep Matches

Sometimes you know you want to match a node but don't know its depth in the tree, and thus can't hardcode a whole matching tree. To deal with this situation you can use the `containerOf` matcher. For example, this matcher will find the first `done` call inside a mocha test, accounting for whatever name might have been used for the parameter:

```ts
import * as m from '@codemod/matchers'

const doneParamName = m.capture(m.anyString())
const matcher = m.callExpression(m.identifier('test'), [
  m.anyString(),
  m.function(
    [m.identifier(doneParam)],
    m.containerOf(m.callExpression(m.identifier(m.fromCapture(doneParamName))))
  ),
])

// matches because there's a `done()` call
matcher.match(
  expr(`
  test('setTimeout calls back around N ms later', function(done) {
    const now = Date.now();
    const duration = 5;

    setTimeout(function() {
      assert.ok(Date.now() - now < 10);
      done();
    }, duration);
  });
`)
)

// does not match because there's no `done()` call
matcher.match(
  expr(`
  test('adds things', function() {
    assert.strictEqual(3 + 4, 7);
  });
`)
)
```

### Custom Matchers

The easiest way to build custom matchers is simply by composing existing ones:

```ts
import * as m from '@codemod/matchers'
import * as t from '@babel/types'

function plusEqualOne() {
  return m.assignmentExpression(
    '+=',
    m.anything(), // or just `undefined` for the same effect
    m.numericLiteral(1)
  )
}

const matcher = plusEqualOne()

matcher.match(expr('a += 1')) // true
matcher.match(expr('a.b += 1')) // true
matcher.match(expr('a -= 1')) // false
matcher.match(expr('a += 2')) // false
```

You can build simple custom matchers easily using a predicate:

```ts
import * as m from '@codemod/matchers'

const oddNumberMatcher = m.matcher(
  (value) => typeof value === 'number' && Math.abs(number % 2) === 1
)

oddNumberMatcher.match(expr('-1')) // true
oddNumberMatcher.match(expr('0')) // false
oddNumberMatcher.match(expr('1')) // true
oddNumberMatcher.match(expr('2')) // true
oddNumberMatcher.match(expr('3')) // true
oddNumberMatcher.match(expr('Infinity')) // false
oddNumberMatcher.match(expr('NaN')) // false
```

Such matchers are easily parameterized by wrapping it in a function:

```ts
import * as m from '@codemod/matchers';

function stringMatching(pattern: RegExp) {
  return m.matcher(
    value => typeof value === 'string' && pattern.test(value)
  );
)

const startsWithRun = stringMatching(/^run/);

startsWithRun.match('run');     // true
startsWithRun.match('runner');  // true
startsWithRun.match('running'); // true
startsWithRun.match('ruining'); // false
startsWithRun.match(' run');    // false
startsWithRun.match('');        // false
startsWithRun.match(1);         // false
```

A common case where you think you'd need a custom matcher is when you want one of a few possible values. In such cases you can use the `or` matcher:

```ts
import * as m from '@codemod/matchers'

const matcher = m.or(m.anyString(), m.anyNumber())

matcher.match(1) // true
matcher.match('string') // true
matcher.match({}) // false
matcher.match(expr('1')) // false
```

Matching one of a few values is common when dealing with things such as functions, which could be arrow functions, function expressions, or function declarations. Here's a more general version of the `IDENTITY` codemod which uses the `or` matcher to also replace arrow functions:

```ts
/**
 * Replaces identity functions with `IDENTITY`:
 *
 *   list.filter(function(a) { return a; });
 *   list2.filter(a => a);
 *
 * becomes:
 *
 *   list.filter(IDENTITY);
 *   list2.filter(IDENTITY);
 */
import * as m from '@codemod/matchers'
import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function () {
  return {
    visitor: {
      FunctionExpression(path: NodePath<t.FunctionExpression>): void {
        const argumentNameMatcher = m.capture(m.anyString())
        const matcher = m.function(
          [m.identifier(argumentNameMatcher)],
          m.or(
            m.blockStatement([
              m.returnStatement(
                m.identifier(m.fromCapture(argumentNameMatcher))
              ),
            ]),
            m.identifier(m.fromCapture(argumentNameMatcher))
          )
        )

        if (matcher.match(path.node)) {
          path.replaceWith(t.identifier('IDENTITY'))
        }
      },
    },
  }
}
```

You probably won't need it, but you can build your own by subclassing `Matcher`. Here's the same `stringMatching` but as a subclass of `Matcher`:

```ts
import * as m from '@codemod/matchers'
import * as t from '@babel/types'

// This is more ceremony than the simple predicate-based one above.
class StringMatching extends m.Matcher<string> {
  constructor(private readonly pattern: RegExp) {
    super()
  }

  matchValue(
    value: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): value is string {
    return typeof value === 'string' && this.pattern.test(value)
  }
}

const startsWithRun = new StringMatching(/^run/)

startsWithRun.match('run') // true
startsWithRun.match('runner') // true
startsWithRun.match('running') // true
startsWithRun.match('ruining') // false
startsWithRun.match(' run') // false
startsWithRun.match('') // false
startsWithRun.match(1) // false
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## License

Copyright 2019 Brian Donovan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
