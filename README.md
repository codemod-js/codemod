# babel-codemod

babel-codemod rewrites JavaScript using babel plugins.

## Install

Install from yarn:

```
$ yarn global add babel-codemod
```

> NOTE: You can also install using `npm install -g babel-codemod`.

This will install the runner as `codemod`. This package requires node v6 or higher.

## Usage

The primary interface is as a command line tool, usually run like so:

```
$ codemod --plugin transform-module-name \
  path/to/file.js \
  another/file.js
```

This will re-write the files `path/to/file.js` and `another/file.js` by transforming them with the babel plugin `transform-module-name`. Multiple plugins may be specified, and multiple file or directories may be re-written at once.

For more detailed options, run `codemod --help`.

## Writing a Plugin

There are [many, many existing plugins](https://yarnpkg.com/en/packages?q=babel-plugin) that you can use. However, if you need to write your own you should consult the [babel handbook](https://github.com/thejameskyle/babel-handbook). If you publish a plugin intended specifically as a codemod, consider using both the [`babel-plugin`](https://yarnpkg.com/en/packages?q=babel-plugin) and [`babel-codemod`](https://yarnpkg.com/en/packages?q=babel-codemod) keywords.

### Transpiling using babel plugins

`babel-codemod` also supports non-standard/future language features that are not currently supported by the latest version of node.  It does this by leveraging `babel-preset-env` which loads the [latest babel plugins](https://github.com/babel/babel/tree/master/packages/babel-preset-env#support-all-plugins-in-babel-that-are-considered-latest).  This feature is on by default.

This feature should support most use cases when writing plugins in advanced JavaScript syntax. However, if you are writing plugins with syntax that is beyond "latest", or you would like to use your own set of plugins and presets, you can pass in the `--find-babel-config` switch in combination with a local `.babelrc` file that lists the presets/plugins you want applied to your plugin code.

```
# Run a local plugin that is passed through locally installed babel plugins
$ codemod --find-babel-config --plugin ./my-plugin.js src/
```

This requires that all babel plugins and presets be installed locally and are listed in your `.babelrc` file.  `babel-codemod` uses `babel-register` under the hood too accomplish this and all `.babelrc` [lookup rules apply](https://babeljs.io/docs/usage/babelrc/#lookup-behavior).

### Transpiling using TypeScript
There is currently an [open issue](https://github.com/square/babel-codemod/issues/51) for supporting plugins written in typescript.  In the interim, you can take the same approach using `--require` along with `ts-node/register`. 

For example:

```
# Run a local plugin written with TypeScript.
$ codemod --require ts-node/register --plugin ./my-plugin.ts src/
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## Status

[![Build Status](https://travis-ci.org/square/babel-codemod.svg?branch=master)](https://travis-ci.org/square/babel-codemod) [![dependencies Status](https://david-dm.org/square/babel-codemod/status.svg)](https://david-dm.org/square/babel-codemod) [![Greenkeeper badge](https://badges.greenkeeper.io/square/babel-codemod.svg)](https://greenkeeper.io/)

## License
Copyright 2017 Square, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
