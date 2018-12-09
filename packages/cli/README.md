# codemod

codemod rewrites JavaScript and TypeScript using babel plugins.

## Install

Install from npm:

```sh
$ npm install -g @codemod/cli
```

> NOTE: You can also install using `yarn global add @codemod/cli`.

This will install the runner as `codemod`. This package requires node v6 or higher.

## Usage

The primary interface is as a command line tool, usually run like so:

```sh
$ codemod --plugin transform-module-name \
  path/to/file.js \
  another/file.js \
  a/directory
```

This will re-write the files `path/to/file.js`, `another/file.js`, and any supported files found in `a/directory` by transforming them with the babel plugin `transform-module-name`. Multiple plugins may be specified, and multiple files or directories may be re-written at once.

Note that TypeScript support is provided by babel and therefore may not completely support all valid TypeScript code. If you encounter an issue, consider looking for it in the [babel issues labeled `area: typescript`](https://github.com/babel/babel/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3A%22area%3A+typescript%22+) before filing an issue.

Plugins may also be loaded from remote URLs, including saved [AST Explorer](https://astexplorer.net/) URLs, using `--remote-plugin`. This feature should only be used as a convenience to load code that you or someone you trust wrote. It will run with your full user privileges, so please exercise caution!

```sh
$ codemod --remote-plugin URL …
```

By default, `codemod` makes minimal changes to your source files by using [recast](https://github.com/benjamn/recast) to parse and print your code, retaining the original comments and formatting. If desired, you can reformat files using [Prettier](https://prettier.io/) by using `--printer prettier`. Note that this is typically only desired in projects that use Prettier, or if you plan on adopting Prettier.

For more detailed options, run `codemod --help`.

## Writing a Plugin

There are [many, many existing plugins](https://www.npmjs.com/search?q=babel-plugin) that you can use. However, if you need to write your own you should consult the [babel handbook](https://github.com/thejameskyle/babel-handbook). If you publish a plugin intended specifically as a codemod, consider using both the [`babel-plugin`](https://www.npmjs.com/search?q=babel-plugin) and [`babel-codemod`](https://www.npmjs.com/search?q=babel-codemod) keywords.

### Transpiling using babel plugins

`codemod` also supports non-standard/future language features that are not currently supported by the latest version of node. It does this by leveraging `@babel/preset-env` which loads the [latest babel plugins](https://github.com/babel/babel/tree/master/packages/babel-preset-env#support-all-plugins-in-babel-that-are-considered-latest). This feature is on by default.

This feature should support most use cases when writing plugins in advanced JavaScript syntax. However, if you are writing plugins with syntax that is beyond "latest", or you would like to use your own set of plugins and presets, you can pass in the `--find-babel-config` switch in combination with a local `.babelrc` file that lists the presets/plugins you want applied to your plugin code.

```sh
# Run a local plugin that is passed through locally installed babel plugins
$ codemod --find-babel-config --plugin ./my-plugin.js src/
```

This requires that all babel plugins and presets be installed locally and are listed in your `.babelrc` file. `codemod` uses `@babel/core` under the hood to accomplish this and all `.babelrc` [lookup rules apply](https://babeljs.io/docs/usage/babelrc/#lookup-behavior).

### Transpiling using TypeScript

There is experimental support for running plugins written in TypeScript. This is on by default and works by using `@babel/preset-typescript` rather than the official TypeScript compiler. This feature may be removed in the future.

For example:

```sh
# Run a local plugin written with TypeScript.
$ codemod --plugin ./my-plugin.ts src/
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## Status

[![Build Status](https://travis-ci.org/codemod-js/codemod.svg?branch=master)](https://travis-ci.org/codemod-js/codemod) [![dependencies Status](https://david-dm.org/codemod-js/codemod/status.svg)](https://david-dm.org/codemod-js/codemod) [![Greenkeeper badge](https://badges.greenkeeper.io/codemod-js/codemod.svg)](https://greenkeeper.io/)

## License

Copyright 2017-2018 Square, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
