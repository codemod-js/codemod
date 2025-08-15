# Contributing

Much of the [prelude of the Babel contribution guide](https://github.com/babel/babel/blob/7.0/CONTRIBUTING.md#not-sure-where-to-start) also applies for this project, since it operates on and with Babel plugins. In particular:

- [AST Explorer](http://astexplorer.net/#/scUfOmVOG5) is a very useful tool for examining ASTs and prototyping plugins.
- [The Babel Plugin handbook](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-plugin-handbook) is a great resource for understanding Babel plugins.

This project is written with [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that allows explicit type annotations and includes a type checker.

## Developing

codemod expects at least node 18 and pnpm 10. You can check each of these with `node -v` and `pnpm -v`. Look for instructions on installing node [here](https://nodejs.org) and pnpm [here](https://pnpm.io/).
As long as you have pnpm 10 or later installed globally, pnpm will automatically run the version of pnpm specified in the `packageManager` field of `package.json`.

### Setup

```sh
$ git clone https://github.com/codemod-js/codemod
$ cd codemod
$ pnpm install
```

Then make sure the tests pass:

```sh
$ pnpm check
```

### Running linting/testing

We use [ESLint](https://eslint.org/). To run ESLint on the project, run:

```sh
$ pnpm lint
```

To automatically fix some of the issues ESLint finds:

```sh
$ pnpm lint:fix
```

The tests in this project are written using [Jest](https://jestjs.io/) and, like the non-test code, are also written in TypeScript. To run the tests:

```sh
$ pnpm test
```

## Submitting Changes

We accept pull requests for bug fixes and improvements. For non-trivial changes it's usually a good idea to open an issue first to track the bug you'd like to fix or discuss the improvement you'd like to contribute.

### A good pull request…

- **Is tested.** Any bugs fixed should have a test that fails without the fix. Any features added should have tests covering the expected usage and expected failures.
- **Is documented.** Reference any existing issues that your pull request addresses. Provide a reasonable description in the pull request body. Documentation of expected usage for new features is required. Documentation is generally not needed for bug-fix pull requests, but sometimes a bug happened because an API was poorly understood. Consider improving the documentation such that a similar bug would not be introduced in the future.
- **Is narrow in scope.** Pull requests that make broad, sweeping changes are generally a bad idea. Instead, larger refactors or improvements should be broken down into multiple smaller pull requests.
